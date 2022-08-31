import { isClass, isUndefined, ObjectConstructor } from "@ipare/core";
import { getPipeRecords, PipeReqRecord, PipeReqType } from "@ipare/pipe";
import { Action, MapItem, RouterOptions } from "@ipare/router";
import { getRules, RuleRecord, V } from "@ipare/validator";
import {
  ComponentsObject,
  OpenApiBuilder,
  OperationObject,
  ParameterLocation,
  ParameterObject,
  PathItemObject,
  RequestBodyObject,
  SchemaObject,
  TagObject,
} from "openapi3-ts";
import "../validator.decorator";
import {
  getNamedValidates,
  setActionValue,
  setSchemaValue,
  setParamValue,
  setRequestBodyValue,
} from "./schema-dict";

const jsonTypes = [
  "application/json-patch+json",
  "application/json",
  "text/json",
  "application/*+json",
];

const lib = V();

export class Parser {
  constructor(
    private readonly routerMap: readonly MapItem[],
    private readonly builder: OpenApiBuilder,
    private readonly routerOptions: RouterOptions & { dir: string }
  ) {}

  public parse() {
    this.parseTags();
    this.parsePaths();
    return this.builder.getSpec();
  }

  private parseTags() {
    const tags = this.builder.getSpec().tags as TagObject[];
    for (const mapItem of this.routerMap) {
      const action = mapItem.getAction(this.routerOptions.dir);
      const rules = this.getActionRules(action);
      const isIgnore = rules.some((rule) =>
        rule.validates.some((v) => v.name == lib.Ignore.name)
      );
      if (isIgnore) continue;

      getNamedValidates(rules, lib.Tags.name).forEach((v) => {
        (v.args ?? []).forEach((arg) => {
          if (!tags.some((t) => t.name == arg)) {
            this.builder.addTag({
              name: arg,
            });
          }
        });
      });
    }
  }

  private getActionRules(action: ObjectConstructor<Action>) {
    return getRules(action).filter(
      (rule) =>
        isUndefined(rule.parameterIndex) && isUndefined(rule.propertyKey)
    );
  }

  private parsePaths() {
    const urls = this.getUrls();
    for (const url in urls) {
      this.parseUrlItems(url, urls[url]);
    }
  }

  private getUrls(): Record<string, MapItem[]> {
    return this.routerMap.reduce((group, mapItem) => {
      const { url } = mapItem;
      group[url] = group[url] ?? [];
      group[url].push(mapItem);
      return group;
    }, {});
  }

  private parseUrlItems(url: string, mapItems: MapItem[]) {
    url = url.replace(/(^|\/)\^(.*?)($|\/)/, "$1{$2}$3");
    url = "/" + url;
    const pathItem: PathItemObject = {};
    this.builder.addPath(url, pathItem);

    for (const mapItem of mapItems) {
      const action = mapItem.getAction(this.routerOptions.dir);
      for (const method of mapItem.methods) {
        this.parseUrlMethodItem(pathItem, method.toLowerCase(), action);
      }
    }
  }

  private parseUrlMethodItem(
    pathItem: PathItemObject,
    method: string,
    action: ObjectConstructor<Action>
  ) {
    const operation = {
      responses: {},
      parameters: [],
    };
    pathItem[method] = operation;
    const actionCassRules = this.getActionRules(action);
    setActionValue(lib, operation, actionCassRules);

    const pipeReqRecords = getPipeRecords(action);
    const rules = getRules(action);

    for (const record of pipeReqRecords) {
      if (record.type == "body") {
        this.parseBody(operation, action, record, rules);
      } else {
        this.parseParam(operation, action, record, rules);
      }
    }
  }

  private parseBody(
    optObj: OperationObject,
    action: ObjectConstructor<Action>,
    record: PipeReqRecord,
    rules: RuleRecord[]
  ) {
    const requestBody = (optObj.requestBody as RequestBodyObject) ?? {
      content: {},
    };
    optObj.requestBody = requestBody;

    const bodyRules = rules.filter((rule) => {
      if (!isUndefined(record.propertyKey)) {
        return rule.propertyKey == record.propertyKey;
      }
      if (!isUndefined(record.parameterIndex)) {
        return rule.parameterIndex == record.parameterIndex;
      }
      return false;
    });

    setRequestBodyValue(lib, requestBody, bodyRules);

    const mediaTypes: string[] = [];
    if (
      !getNamedValidates(bodyRules, lib.RemoveDefaultMediaTypes.name).length
    ) {
      mediaTypes.push(...jsonTypes);
    }
    getNamedValidates(bodyRules, lib.MediaTypes.name).forEach((validate) => {
      mediaTypes.push(...(validate.args ?? []));
    });

    for (const media of mediaTypes) {
      this.parseBodyMediaSchema(requestBody, media, action, record, bodyRules);
    }
  }

  private parseBodyMediaSchema(
    requestBody: RequestBodyObject,
    media: string,
    action: ObjectConstructor<Action>,
    record: PipeReqRecord,
    rules: RuleRecord[]
  ) {
    const mediaObj = requestBody.content[media] ?? {};
    requestBody.content[media] = mediaObj;

    if (!!record.property) {
      mediaObj.schema = mediaObj.schema ?? {
        type: "object",
        properties: {},
      };
      const mediaSchema = mediaObj.schema as SchemaObject;
      mediaSchema.properties = mediaSchema.properties ?? {};
      const properties = mediaSchema.properties as Exclude<
        typeof mediaSchema.properties,
        undefined
      >;
      const propertyCls = Reflect.getMetadata(
        "design:type",
        action,
        record.property
      );
      const propertySchema = {
        type: typeToApiType(propertyCls),
        nullable: true,
      } as SchemaObject;
      properties[record.property] = propertySchema;

      setSchemaValue(lib, propertySchema, rules);
    } else {
      const modelType = this.getPipeRecordModelType(action, record);
      if (isClass(modelType)) {
        this.setModelSchema(modelType, this.getComponentSchema(modelType.name));
        mediaObj.schema = mediaObj.schema ?? {
          type: "object",
          properties: {},
        };
        this.setModelSchema(modelType, mediaObj.schema as SchemaObject);
      }
    }
  }

  private setModelSchema(modelType: ObjectConstructor, schema: SchemaObject) {
    const propertiesObject = schema.properties as Exclude<
      typeof schema.properties,
      undefined
    >;

    const rules = getRules(modelType).filter(
      (rule) => !isUndefined(rule.propertyKey)
    );
    const properties = rules.reduce((prev, cur) => {
      (prev[cur.propertyKey as string] =
        prev[cur.propertyKey as string] || []).push(cur);
      return prev;
    }, {});
    Object.keys(properties).forEach((property) => {
      const propertyCls = Reflect.getMetadata(
        "design:type",
        modelType,
        property
      );

      const propertySchema = {
        type: typeToApiType(propertyCls),
        nullable: true,
      };
      propertiesObject[property] = propertySchema;

      const propertyRules = properties[property];
      setSchemaValue(lib, propertySchema, propertyRules);
    });
  }

  private getComponentSchema(name: string) {
    const components = this.builder.getSpec().components as ComponentsObject;
    const schemas = components.schemas as Record<string, SchemaObject>;
    let schema = schemas[name] as SchemaObject;
    if (!schema) {
      schema = {
        type: "object",
        properties: {},
      };
      this.builder.addSchema(name, schema);
    }
    return schema;
  }

  private parseParam(
    optObj: OperationObject,
    action: ObjectConstructor<Action>,
    record: PipeReqRecord,
    rules: RuleRecord[]
  ) {
    if (record.property) {
      const parameters = optObj.parameters as ParameterObject[];
      const paramterRules = rules.filter((rule) => {
        if (!isUndefined(record.propertyKey)) {
          return rule.propertyKey == record.propertyKey;
        }
        if (!isUndefined(record.parameterIndex)) {
          return rule.parameterIndex == record.parameterIndex;
        }
        return false;
      });
      const parameter = this.createParameter(
        record.property,
        record,
        paramterRules
      );
      parameters.push(parameter);
    } else {
      const modelType = this.getPipeRecordModelType(action, record);
      if (!modelType) return;
      this.parseModelParam(optObj, record, modelType);
    }
  }

  private parseModelParam(
    optObj: OperationObject,
    record: PipeReqRecord,
    modelType: ObjectConstructor
  ) {
    const parameters = optObj.parameters as ParameterObject[];

    const rules = getRules(modelType).filter(
      (rule) => !isUndefined(rule.propertyKey)
    );
    const properties = rules.reduce((prev, cur) => {
      (prev[cur.propertyKey as string] =
        prev[cur.propertyKey as string] || []).push(cur);
      return prev;
    }, {});
    Object.keys(properties).forEach((property) => {
      const parameter = this.createParameter(
        property,
        record,
        properties[property]
      );
      parameters.push(parameter);
    });
  }

  private createParameter(
    property: string,
    record: PipeReqRecord,
    rules: RuleRecord[]
  ) {
    const parameter: ParameterObject = {
      name: property,
      in: pipeTypeToDocType(record.type),
      required: record.type == "param",
      schema: {
        type: "string",
      },
    };

    setParamValue(lib, parameter, rules);
    setSchemaValue(lib, parameter.schema as SchemaObject, rules);

    return parameter;
  }

  private getPipeRecordModelType(
    cls: ObjectConstructor,
    record: PipeReqRecord
  ): ObjectConstructor | undefined {
    let result: ObjectConstructor;
    if (!isUndefined(record.parameterIndex)) {
      const paramTypes = Reflect.getMetadata("design:paramtypes", cls) ?? [];
      result = paramTypes[record.parameterIndex];
    } else {
      result = Reflect.getMetadata(
        "design:type",
        cls.prototype,
        record.propertyKey
      );
    }
    return result;
  }
}

function typeToApiType(
  type?: any
):
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "integer"
  | "null"
  | "array"
  | undefined {
  if (type == String) {
    return "string";
  } else if (type == Number) {
    return "number";
  } else if (type == BigInt) {
    return "integer";
  } else if (type == Boolean) {
    return "boolean";
  } else if (type == Array) {
    return "array";
  } else {
    return "object";
  }
}

export function pipeTypeToDocType(pipeType: PipeReqType): ParameterLocation {
  if (pipeType == "body") {
    throw new Error();
  }

  switch (pipeType) {
    case "header":
      return "header";
    case "query":
      return "query";
    default:
      return "path";
  }
}
