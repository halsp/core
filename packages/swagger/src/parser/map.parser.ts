import { ObjectConstructor } from "@sfajs/core";
import { Action, MapItem, RouterOptions } from "@sfajs/router";
import { OpenApiBuilder, PathItemObject } from "openapi3-ts";
import {
  ACTION_METADATA_API_SUMMARY,
  ACTION_METADATA_API_TAGS,
} from "../constant";
import { ActionParser } from "./action.parser";

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

    new ActionParser(pathItem[method], action).parse();
  }
}
