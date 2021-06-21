import { existsSync, lstatSync, readFileSync } from "fs";
import linq = require("linq");
import path = require("path");
import Constant from "../Constant";
import MapCreater from "./MapCreater";
import MapItem from "./MapItem";
import PathParser from "./PathParser";
import { HttpContext, HttpMethod } from "sfa";

export default class MapParser {
  #mapItem!: MapItem;
  public get mapItem(): MapItem {
    return this.#mapItem;
  }

  public notFound = false;
  public methodNotAllowed = false;

  constructor(
    private readonly ctx: HttpContext,
    private readonly dir: string,
    private readonly strict: boolean
  ) {
    if (!existsSync(dir) || !lstatSync(dir).isDirectory()) {
      this.notFound = true;
      return;
    }

    const mapItem = this.getMapItem();
    if (mapItem) {
      this.#mapItem = mapItem;
    }
  }

  private getMapItem(): MapItem | undefined {
    const map = this.getMap();
    let mapItem;
    if (!this.strict) {
      const matchedPaths = linq
        .from(map)
        .where((item) => this.isSimplePathMatched(item.path))
        .toArray();
      mapItem = this.getMostLikeMapItem(matchedPaths);
      if (mapItem) return mapItem;
    }

    const matchedPaths = linq
      .from(map)
      .where((item) => !!new PathParser(item.path).httpMethod)
      .where((item) => this.isMethodPathMatched(item.path, true))
      .toArray();
    mapItem = this.getMostLikeMapItem(matchedPaths);
    if (mapItem) return mapItem;

    const anyMethodPaths = linq
      .from(map)
      .where((item) => new PathParser(item.path).httpMethod == HttpMethod.any)
      .where((item) => this.isMethodPathMatched(item.path, false))
      .toArray();
    mapItem = this.getMostLikeMapItem(anyMethodPaths);
    if (mapItem) return mapItem;

    const otherMethodPathCount = linq
      .from(map)
      .where((item) => !!new PathParser(item.path).httpMethod)
      .where((item) => this.isMethodPathMatched(item.path, false))
      .count();

    if (otherMethodPathCount) {
      this.methodNotAllowed = true;
    } else {
      this.notFound = true;
    }
  }

  private isSimplePathMatched(mapPath: string): boolean {
    mapPath = this.removeExtension(mapPath);
    const reqUrlStrs = this.ctx.req.path.toLowerCase().split("/");
    const mapPathStrs = mapPath.toLowerCase().split("/");
    if (reqUrlStrs.length != mapPathStrs.length) return false;

    return this.isPathMatched(mapPathStrs, reqUrlStrs);
  }

  private isMethodPathMatched(
    mapPath: string,
    methodIncluded: boolean
  ): boolean {
    mapPath = this.removeExtension(mapPath);
    const reqUrlStrs = this.ctx.req.path
      ? this.ctx.req.path.toLowerCase().split("/")
      : [];
    const mapPathStrs = mapPath.toLowerCase().split("/");
    if (reqUrlStrs.length != mapPathStrs.length - 1) return false;
    if (!this.ctx.req.method) return false;

    if (methodIncluded) {
      reqUrlStrs.push(String(this.ctx.req.method).toLowerCase());
    } else {
      mapPathStrs.splice(mapPathStrs.length - 1, 1);
    }

    return this.isPathMatched(mapPathStrs, reqUrlStrs);
  }

  private getMostLikeMapItem(mapItems: MapItem[]): MapItem | undefined {
    if (!mapItems || !mapItems.length) return;
    if (mapItems.length == 1) return mapItems[0];

    const pathsParts = <{ mapItem: MapItem; parts: string[] }[]>[];
    mapItems.forEach((mapItem) => {
      pathsParts.push({
        mapItem: mapItem,
        parts: mapItem.path.toLowerCase().split("/"),
      });
    });

    const minPartsCount = Math.min(
      ...linq
        .from(pathsParts)
        .select((pp) => pp.parts.length)
        .toArray()
    );
    for (let i = 0; i < minPartsCount; i++) {
      const notLikeItems = linq
        .from(pathsParts)
        .select((pp) => ({ part: pp.parts[i], mapItem: pp.mapItem }))
        .where((p) => p.part.includes("^"))
        .toArray();
      if (notLikeItems.length > 0 && notLikeItems.length < pathsParts.length) {
        notLikeItems.forEach((mlp) => {
          const ppToRemove = linq
            .from(pathsParts)
            .where((p) => p.mapItem.path == mlp.mapItem.path)
            .firstOrDefault();
          if (ppToRemove) {
            pathsParts.splice(pathsParts.indexOf(ppToRemove), 1);
          }
        });
      }

      if (pathsParts.length == 1) return pathsParts[0].mapItem;
    }

    const mostLikePathParts = linq
      .from(pathsParts)
      .orderBy((pp) => pp.parts.length)
      .first();
    if (!mostLikePathParts) return;
    return mostLikePathParts.mapItem;
  }

  private removeExtension(name: string): string {
    return name.replace(/\.[^\.]+$/, "");
  }

  private isPathMatched(mapPathStrs: string[], reqUrlStrs: string[]): boolean {
    for (let i = 0; i < mapPathStrs.length; i++) {
      if (mapPathStrs[i] != reqUrlStrs[i] && !mapPathStrs[i].startsWith("^")) {
        return false;
      }
    }
    return true;
  }

  private getMap(): MapItem[] {
    const mapPath = path.join(process.cwd(), Constant.mapFileName);
    if (existsSync(mapPath)) {
      return JSON.parse(readFileSync(mapPath, "utf-8"));
    } else {
      return new MapCreater(this.dir).map;
    }
  }
}
