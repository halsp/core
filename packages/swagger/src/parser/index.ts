import { isClass, isUndefined, ObjectConstructor } from "@ipare/core";
import { getPipeRecords, PipeReqRecord } from "@ipare/pipe";
import { Action, MapItem, RouterOptions } from "@ipare/router";
import { getRules, RuleRecord } from "@ipare/validator";
import {
  OpenApiBuilder,
  OperationObject,
  ParameterObject,
  PathItemObject,
  RequestBodyObject,
  SchemaObject,
  TagObject,
} from "openapi3-ts";
import "../validator.decorator";
import {
  setActionValue,
  setSchemaValue,
  setParamValue,
  setRequestBodyValue,
  ArrayItemType,
} from "./schema-dict";
import {
  existIgnore,
  getNamedValidates,
  jsonTypes,
  lib,
  parseArraySchema,
  parseModelProperty,
  pipeTypeToDocType,
  setComponentModelSchema,
  setModelSchema,
  typeToApiType,
} from "./utils";

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
      const isIgnore = existIgnore(rules);
      if (isIgnore) continue;

      getNamedValidates(rules, lib.Tags.name).forEach((v) => {
        v.args.forEach((arg) => {
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
    const actionClassRules = this.getActionRules(action);
    if (existIgnore(actionClassRules)) {
      return;
    }

    const operation = {
      responses: {},
      parameters: [],
    } as OperationObject;
    pathItem[method] = operation;

    setActionValue(this.builder, operation, actionClassRules);

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
    const bodyRules = rules.filter((rule) => {
      if (!isUndefined(record.propertyKey)) {
        return rule.propertyKey == record.propertyKey;
      } else {
        return rule.parameterIndex == record.parameterIndex;
      }
    });
    if (existIgnore(bodyRules)) {
      return;
    }

    const requestBody = (optObj.requestBody as RequestBodyObject) ?? {
      content: {},
    };
    optObj.requestBody = requestBody;
    setRequestBodyValue(this.builder, requestBody, bodyRules);

    const actionRules = rules.filter(
      (r) => isUndefined(r.propertyKey) && isUndefined(r.parameterIndex)
    );
    const mediaTypes: string[] = [];
    const mediaValidates = getNamedValidates(actionRules, lib.MediaTypes.name);
    if (mediaValidates.length) {
      mediaValidates.forEach((validate) => {
        mediaTypes.push(...validate.args);
      });
    }
    if (!mediaTypes.length) {
      mediaTypes.push(...jsonTypes);
    }

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
      };
      const mediaSchema = mediaObj.schema as SchemaObject;
      mediaSchema.properties = mediaSchema.properties ?? {};
      const properties = mediaSchema.properties as Exclude<
        typeof mediaSchema.properties,
        undefined
      >;

      parseModelProperty(
        this.builder,
        properties,
        action,
        record.property,
        rules
      );

      mediaSchema.required = Object.keys(properties).filter(
        (property) => (properties[property] as SchemaObject).nullable == false
      );
    } else {
      const modelType = this.getPipeRecordModelType(action, record);
      const type = typeToApiType(modelType);
      if (type == "array") {
        mediaObj.schema = {
          type,
        };
        getNamedValidates(rules, lib.Items.name).forEach((v) => {
          parseArraySchema(
            this.builder,
            mediaObj.schema as SchemaObject,
            lib,
            v.args[0] as ArrayItemType
          );
        });
      } else if (isClass(modelType)) {
        mediaObj.schema = mediaObj.schema ?? {
          type,
          properties: {},
        };

        setComponentModelSchema(this.builder, modelType);
        setModelSchema(
          this.builder,
          modelType,
          mediaObj.schema as SchemaObject
        );
      } else {
        mediaObj.schema = mediaObj.schema ?? {
          type,
        };
        setSchemaValue(this.builder, mediaObj.schema as SchemaObject, rules);
      }
    }
  }

  private parseParam(
    optObj: OperationObject,
    action: ObjectConstructor<Action>,
    record: PipeReqRecord,
    rules: RuleRecord[]
  ) {
    const propertyRules = rules.filter((rule) => {
      if (!isUndefined(record.propertyKey)) {
        return rule.propertyKey == record.propertyKey;
      } else {
        return rule.parameterIndex == record.parameterIndex;
      }
    });
    if (existIgnore(propertyRules)) {
      return;
    }

    const modelType = this.getPipeRecordModelType(action, record);
    if (record.property) {
      const parameters = optObj.parameters as ParameterObject[];
      const parameter = this.createParameter(
        record.property,
        record,
        propertyRules,
        modelType
      );
      parameters.push(parameter);
    } else {
      if (!isClass(modelType)) return;

      setComponentModelSchema(this.builder, modelType);
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
    const propertiesRules = rules.reduce((prev, cur) => {
      (prev[cur.propertyKey as string] =
        prev[cur.propertyKey as string] || []).push(cur);
      return prev;
    }, {});
    for (const property in propertiesRules) {
      if (existIgnore(propertiesRules[property])) {
        continue;
      }

      const propertyType = Reflect.getMetadata(
        "design:type",
        modelType.prototype,
        property
      );
      const parameter = this.createParameter(
        property,
        record,
        propertiesRules[property],
        propertyType
      );
      parameters.push(parameter);
    }
  }

  private createParameter(
    property: string,
    record: PipeReqRecord,
    rules: RuleRecord[],
    paramType?: ObjectConstructor
  ) {
    const type = typeToApiType(paramType);
    const parameter: ParameterObject = {
      name: property,
      in: pipeTypeToDocType(record.type),
      required: record.type == "param",
      schema: {
        type,
      },
    };
    setParamValue(this.builder, parameter, rules);

    const schema = parameter.schema as SchemaObject;
    if (type == "array") {
      getNamedValidates(rules, lib.Items.name).forEach((v) => {
        parseArraySchema(this.builder, schema, lib, v.args[0] as ArrayItemType);
      });
    } else if (isClass(paramType)) {
      setComponentModelSchema(this.builder, paramType);
      parameter.schema = {
        $ref: `#/components/schemas/${paramType.name}`,
      };
    } else {
      setSchemaValue(this.builder, schema, rules);
    }

    return parameter;
  }

  private getPipeRecordModelType(
    cls: ObjectConstructor,
    record: PipeReqRecord
  ): ObjectConstructor | undefined {
    let result: ObjectConstructor;
    if (!isUndefined(record.parameterIndex)) {
      const paramTypes = Reflect.getMetadata("design:paramtypes", cls);
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
