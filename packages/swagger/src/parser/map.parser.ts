import { isClass, ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord, PIPE_RECORDS_METADATA } from "@sfajs/pipe";
import { Action, MapItem, RouterOptions } from "@sfajs/router";
import {
  OpenApiBuilder,
  OperationObject,
  ParameterObject,
  PathItemObject,
  RequestBodyObject,
} from "openapi3-ts";
import {
  ACTION_METADATA_API_SUMMARY,
  ACTION_METADATA_API_TAGS,
} from "../constant";
import {
  getModelPropertyDecorators,
  getPipeRecordModelType,
} from "./utils/decorator";
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
    private readonly routerOptions: RouterOptions & { dir: string }
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
        this.parseUrlMethodItem(
          pathItem,
          method.toLowerCase(),
          mapItem,
          action
        );
      }
    }
  }

  private parseUrlMethodItem(
    pathItem: PathItemObject,
    method: string,
    mapItem: MapItem,
    action: ObjectConstructor<Action>
  ) {
    pathItem[method] = {
      tags: mapItem[ACTION_METADATA_API_TAGS] ?? [],
      summary: mapItem[ACTION_METADATA_API_SUMMARY],
      responses: {},
      parameters: [],
    };

    const optObj = pathItem[method];
    const pipeReqRecords: PipeReqRecord[] =
      Reflect.getMetadata(PIPE_RECORDS_METADATA, action.prototype) ?? [];

    for (const record of pipeReqRecords) {
      if (record.type == "body") {
        this.parseBody(optObj, action, record);
      } else {
        this.parseParam(optObj, action, record);
      }
    }
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
      const modelType = getPipeRecordModelType(action, record);
      if (isClass(modelType)) {
        ensureModelSchema(this.builder, modelType, record.type);
        requestBody.content[media] = {
          schema: {
            $ref: `#/components/schemas/${modelType.name}`,
          },
        };
      }
    }
  }

  private parseParam(
    optObj: OperationObject,
    action: ObjectConstructor<Action>,
    record: PipeReqRecord
  ) {
    const params = optObj.parameters as ParameterObject[];
    if (record.property) {
      params.push({
        name: record.property,
        in: pipeTypeToDocType(record.type),
        required: record.type == "param",
      });
    } else {
      const modelType = getPipeRecordModelType(action, record);
      if (!modelType) return;
      const decs = getModelPropertyDecorators(modelType);
      for (const fn of decs) {
        fn({
          pipeType: record.type,
          schema: optObj,
          builder: this.builder,
        });
      }
    }
  }
}
