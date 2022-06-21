import { MapItem } from "@sfajs/router";
import {
  OpenApiBuilder,
  OpenAPIObject,
  OperationObject,
  TagObject,
} from "openapi3-ts";
import {
  ACTION_METADATA_API_SUMMARY,
  ACTION_METADATA_API_TAGS,
} from "./constant";

export class Parser {
  constructor(
    private readonly routerMap: readonly MapItem[],
    private readonly builder: OpenApiBuilder
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
    const pathItem = this.builder.getSpec().paths[url] ?? {};

    for (const mapItem of mapItems) {
      for (const method of mapItem.methods) {
        pathItem[method.toLowerCase()] = {
          tags: mapItem[ACTION_METADATA_API_TAGS] ?? [],
          summary: mapItem[ACTION_METADATA_API_SUMMARY],
        } as OperationObject;
      }
    }

    this.builder.addPath(url, pathItem);
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
