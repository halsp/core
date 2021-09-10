import { existsSync, lstatSync, readFileSync } from "fs";
import linq = require("linq");
import path = require("path");
import Constant from "../Constant";
import MapCreater from "./MapCreater";
import MapItem from "./MapItem";
import { HttpContext } from "sfa";
import { HttpMethod } from "@sfajs/header";

export default class MapParser {
  #mapItem!: MapItem;
  public get mapItem(): MapItem {
    return this.#mapItem;
  }

  #map!: MapItem[];
  public get map(): MapItem[] {
    return this.#map;
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

    this.#map = this.getMap();
    const mapItem = this.getMapItem();
    if (mapItem) {
      this.#mapItem = mapItem;
    }
  }

  private getMapItem(): MapItem | undefined {
    let mapItem;
    const matchedPaths = linq
      .from(this.#map)
      .where((m) => !!m.methods.length)
      .where((m) => this.isPathMatched(m, true))
      .toArray();
    if (!this.strict) {
      linq
        .from(this.#map)
        .where((m) => !m.methods.length)
        .where((m) => this.isPathMatched(m, false))
        .forEach((m) => matchedPaths.push(m));
    }
    mapItem = this.getMostLikeMapItem(matchedPaths);
    if (mapItem) return mapItem;

    const anyMethodPaths = linq
      .from(this.#map)
      .where((m) => m.methods.includes(HttpMethod.any))
      .where((m) => this.isPathMatched(m, false))
      .toArray();
    mapItem = this.getMostLikeMapItem(anyMethodPaths);
    if (mapItem) return mapItem;

    const otherMethodPathCount = linq
      .from(this.#map)
      .where((m) => !!m.methods.length)
      .where((m) => this.isPathMatched(m, false))
      .count();

    if (otherMethodPathCount) {
      this.methodNotAllowed = true;
    } else {
      this.notFound = true;
    }
  }

  private isPathMatched(mapItem: MapItem, methodIncluded: boolean): boolean {
    const reqUrlStrs = this.ctx.req.path.toLowerCase().split("/");
    const mapPathStrs = mapItem.reqPath.toLowerCase().split("/");
    if (reqUrlStrs.length != mapPathStrs.length) return false;

    if (methodIncluded && !mapItem.methods.includes(HttpMethod.any)) {
      const matchedMethod = HttpMethod.matched(this.ctx.req.method);
      if (!matchedMethod || !mapItem.methods.includes(matchedMethod)) {
        return false;
      }
    }

    for (let i = 0; i < mapPathStrs.length; i++) {
      if (mapPathStrs[i] != reqUrlStrs[i] && !mapPathStrs[i].startsWith("^")) {
        return false;
      }
    }
    return true;
  }

  private getMostLikeMapItem(mapItems: MapItem[]): MapItem | undefined {
    if (!mapItems || !mapItems.length) return;
    if (mapItems.length == 1) return mapItems[0];

    const pathsParts = <{ mapItem: MapItem; parts: string[] }[]>[];
    mapItems.forEach((mapItem) => {
      pathsParts.push({
        mapItem: mapItem,
        parts: mapItem.reqPath.toLowerCase().split("/"),
      });
    });

    const minPartsCount = Math.min(
      ...linq
        .from(pathsParts)
        .select((pp) => pp.parts.length)
        .toArray()
    );
    for (let i = 0; i < minPartsCount; i++) {
      if (
        linq.from(pathsParts).any((p) => p.parts[i].includes("^")) &&
        linq.from(pathsParts).any((p) => !p.parts[i].includes("^"))
      ) {
        linq
          .from(pathsParts)
          .where((p) => p.parts[i].includes("^"))
          .forEach((p) => pathsParts.splice(pathsParts.indexOf(p), 1));
      }

      if (pathsParts.length == 1) return pathsParts[0].mapItem;
    }

    if (
      linq
        .from(pathsParts)
        .count((pp) => pp.mapItem.methods.includes(HttpMethod.any)) &&
      linq
        .from(pathsParts)
        .any((pp) => !pp.mapItem.methods.includes(HttpMethod.any))
    ) {
      linq
        .from(pathsParts)
        .where((pp) => pp.mapItem.methods.includes(HttpMethod.any))
        .forEach((pp) => {
          pathsParts.splice(pathsParts.indexOf(pp), 1);
        });
    }

    const mostLikePathParts = linq
      .from(pathsParts)
      .orderBy((pp) => pp.parts.length)
      .firstOrDefault();
    if (!mostLikePathParts) return;
    return mostLikePathParts.mapItem;
  }

  private getMap(): MapItem[] {
    const mapPath = path.join(process.cwd(), Constant.mapFileName);
    if (existsSync(mapPath)) {
      const result: MapItem[] = [];
      JSON.parse(readFileSync(mapPath, "utf-8")).forEach((m: MapItem) => {
        const mapItem = result.push(new MapItem(m.path));
        Object.assign(mapItem, m);
        return mapItem;
      });
      return result;
    } else {
      return new MapCreater(this.dir).map;
    }
  }
}
