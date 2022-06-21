import { Action, MapItem, RouterOptions } from "@sfajs/router";
import {
  OpenApiBuilder,
  OpenAPIObject,
  OperationObject,
  ParameterLocation,
  PathItemObject,
  TagObject,
} from "openapi3-ts";
import {
  ACTION_METADATA_API_SUMMARY,
  ACTION_METADATA_API_TAGS,
} from "./constant";
import "reflect-metadata";
import { PipeReqRecord, PipeReqType, PIPE_RECORDS_METADATA } from "@sfajs/pipe";
import { ObjectConstructor } from "@sfajs/core";

export class Parser {
  constructor(
    private readonly routerMap: readonly MapItem[],
    private readonly builder: OpenApiBuilder,
    private readonly routerOptions: RouterOptions & { dir: string }
  ) {
    builder.addInfo({
      title: "@sfajs/swagger",
      version: "1.0.0",
    });
  }

  public parse(): OpenAPIObject {
    this.addTags();

    const tags = this.getExistTags();
    for (const tag of tags) {
      this.parseTagPaths(tag.name);
    }

    const noTagItems = this.routerMap.filter(
      (item) => !item[ACTION_METADATA_API_TAGS]
    );
    this.parseMapItems(noTagItems);

    return this.builder.getSpec();
  }

  private parseTagPaths(tag: string) {
    const mapItems = this.routerMap
      .filter((item) => !!item[ACTION_METADATA_API_TAGS])
      .filter((item) =>
        (item[ACTION_METADATA_API_TAGS] as string[]).includes(tag)
      );

    this.parseMapItems(mapItems);
  }

  private parseMapItems(mapItems: MapItem[]) {
    const urls = mapItems.reduce((group, mapItem) => {
      const { url } = mapItem;
      group[url] = group[url] ?? [];
      group[url].push(mapItem);
      return group;
    }, {});

    for (const url in urls) {
      this.parseUrlItems(url, urls[url]);
    }
  }

  private parseUrlItems(url: string, mapItems: MapItem[]) {
    const pathItem: PathItemObject = this.builder.getSpec().paths[url] ?? {};

    for (const mapItem of mapItems) {
      const action = mapItem.getAction(this.routerOptions.dir);
      for (const method of mapItem.methods) {
        const optObj = <OperationObject>{
          tags: mapItem[ACTION_METADATA_API_TAGS] ?? [],
          summary: mapItem[ACTION_METADATA_API_SUMMARY],
          responses: {},
        };
        pathItem[method.toLowerCase()] = optObj;
        this.parseReqParams(optObj, action);
      }
    }

    this.builder.addPath(url, pathItem);
  }

  private parseReqParams(
    optObj: OperationObject,
    action: ObjectConstructor<Action>
  ) {
    optObj.parameters = optObj.parameters ?? [];
    const pipeReqRecords: PipeReqRecord[] =
      Reflect.getMetadata(PIPE_RECORDS_METADATA, action.prototype) ?? [];

    for (const record of pipeReqRecords) {
      if (record.type == "body") {
      } else {
        const cons: ObjectConstructor<Action> = Reflect.getMetadata(
          "design:type",
          action.prototype,
          record.propertyKey
        );
        if (record.property) {
          optObj.parameters.push({
            name: record.property,
            in: this.pipeTypeToDocType(record.type),
          });
        } else {
          if (cons) {
            // for (const key in ) {
            //   optObj.parameters.push({
            //     name: key,
            //     in: this.pipeTypeToDocType(record.type),
            //   });
            // }
          }
        }
      }
    }
  }

  private pipeTypeToDocType(pipeType: PipeReqType): ParameterLocation {
    switch (pipeType) {
      case "header":
        return "header";
      case "query":
        return "query";
      default:
        return "path";
    }
  }

  private addTags() {
    const tags = this.getExistTags();
    this.routerMap.forEach((mapItem) => {
      const actionTags: string[] = mapItem[ACTION_METADATA_API_TAGS] ?? [];
      actionTags.forEach((tag) => {
        if (!tags.some((t) => t.name == tag)) {
          this.builder.addTag({
            name: tag,
          });
        }
      });
    });
  }

  private getExistTags() {
    return this.builder.getSpec().tags as TagObject[];
  }
}
