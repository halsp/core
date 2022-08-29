import { isClass, ObjectConstructor } from "@ipare/core";
import { PipeReqRecord, getPipeRecords } from "@ipare/pipe";
import { Action, MapItem, RouterInitedOptions } from "@ipare/router";
import {
  OpenApiBuilder,
  OperationObject,
  ParameterObject,
  PathItemObject,
  RequestBodyObject,
  SchemaObject,
} from "openapi3-ts";
import { ACTION_DECORATORS } from "../constant";
import { ActionCallback } from "../decorators";
import {
  getCallbacks,
  getPipeRecordModelType,
  PipeOperationCallback,
  PipeSchemaCallback,
} from "../decorators/callback.decorator";
import { pipeTypeToDocType } from "./utils/doc-types";
import { ensureModelSchema } from "./utils/model-schema";

const jsonTypes = [
  "application/json-patch+json",
  "application/json",
  "text/json",
  "application/*+json",
];

export class MapParser {
  constructor(
    private readonly routerMap: readonly MapItem[],
    private readonly builder: OpenApiBuilder,
    private readonly routerOptions: RouterInitedOptions
  ) {}

  public parse() {
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
    this.execActionDecoratorCallback(action, operation);

    const pipeReqRecords = getPipeRecords(action);

    for (const record of pipeReqRecords) {
      if (record.type == "body") {
        this.parseBody(operation, action, record);
      } else {
        this.parseParam(operation, action, record);
      }
    }
  }

  private execActionDecoratorCallback(
    action: ObjectConstructor<Action>,
    operation: OperationObject
  ) {
    const cbs: ActionCallback[] =
      Reflect.getMetadata(ACTION_DECORATORS, action.prototype) ?? [];
    cbs.forEach((cb) => cb(operation));
  }

  private parseBody(
    optObj: OperationObject,
    action: ObjectConstructor<Action>,
    record: PipeReqRecord
  ) {
    const requestBody = (optObj.requestBody as RequestBodyObject) ?? {
      content: {},
    };
    optObj.requestBody = requestBody;
    for (const media of jsonTypes) {
      this.parseBodyMediaSchema(requestBody, media, action, record);
    }
  }

  private parseBodyMediaSchema(
    requestBody: RequestBodyObject,
    media: string,
    action: ObjectConstructor<Action>,
    record: PipeReqRecord
  ) {
    const mediaObj = requestBody.content[media] ?? {};
    requestBody.content[media] = mediaObj;

    const modelType = getPipeRecordModelType(action, record);
    if (isClass(modelType)) {
      ensureModelSchema(this.builder, modelType, record);
      mediaObj.schema = {
        $ref: `#/components/schemas/${modelType.name}`,
      };
    } else {
      mediaObj.schema = mediaObj.schema ?? {
        type: "object",
      };
      this.execActionCallback(action, record, mediaObj.schema as SchemaObject);
    }
  }

  private parseParam(
    optObj: OperationObject,
    action: ObjectConstructor<Action>,
    record: PipeReqRecord
  ) {
    if (record.property) {
      const parameters = optObj.parameters as ParameterObject[];
      parameters.push({
        name: record.property,
        in: pipeTypeToDocType(record.type),
        required: record.type == "param",
      });
      this.execActionCallback(action, record, optObj);
    } else {
      const modelType = getPipeRecordModelType(action, record);
      if (!modelType) return;
      const callbacks = getCallbacks(modelType);
      for (const cb of callbacks) {
        (cb.callback as PipeOperationCallback)({
          pipeRecord: record,
          operation: optObj,
          builder: this.builder,
        });
      }
    }
  }

  private execActionCallback(
    action: ObjectConstructor<Action>,
    pipeRecord: PipeReqRecord,
    schema: SchemaObject | OperationObject
  ) {
    getCallbacks(action)
      .filter(
        (cb) =>
          pipeRecord.propertyKey == cb.propertyKey &&
          pipeRecord.parameterIndex == cb.parameterIndex
      )
      .forEach((cb) => {
        if (pipeRecord.type == "body") {
          (cb.callback as PipeSchemaCallback)({
            pipeRecord: pipeRecord,
            schema: schema as SchemaObject,
            builder: this.builder,
          });
        } else {
          (cb.callback as PipeOperationCallback)({
            pipeRecord: pipeRecord,
            operation: schema as OperationObject,
            builder: this.builder,
          });
        }
      });
  }
}
