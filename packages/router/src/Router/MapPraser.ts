import { existsSync, readFileSync } from "fs";
import linq = require("linq");
import path = require("path");
import Config, { RouterConfig } from "../Config";
import Constant from "../Constant";
import MapCreater from "./MapCreater";
import MapItem from "./MapItem";
import PathParser from "./PathParser";
import Action from "../Action";
import { HttpContext, HttpMethod, ResponseError } from "sfa";
import { StatusCodes } from "http-status-codes";

export default class MapPraser {
  #mapItem: MapItem | undefined;
  public get mapItem(): MapItem {
    if (!this.#mapItem) {
      this.#mapItem = this.getMapItem();
    }
    return this.#mapItem;
  }

  constructor(private readonly ctx: HttpContext) {}

  private get unitTest(): RouterConfig {
    return this.ctx.bag<RouterConfig>("B-UnitTest");
  }

  private get dirPath(): string {
    return path.join(process.cwd(), this.dir);
  }

  private get dir(): string {
    if (this.unitTest) {
      return this.unitTest.dir || Constant.defaultRouterDir;
    }

    return Config.getRouterDirPath(Config.default);
  }
  /**
   * strict
   *
   * if not, the path end with the httpMethod word will be matched.
   * for example, the post request with path 'user/get' match 'user.ts'.
   *
   * if true, the action in definition must appoint method.
   */
  private get strict(): boolean {
    if (this.unitTest) {
      return this.unitTest.strict == undefined
        ? !!Constant.defaultStrict
        : this.unitTest.strict;
    }

    const config = Config.default;
    if (config && config.router && config.router.strict != undefined) {
      return config.router.strict;
    }

    return false;
  }

  #action?: Action;
  public get action(): Action {
    if (!this.#action) {
      const filePath = path.join(this.dirPath, this.mapItem.path);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const actionClass = require(filePath).default;
      this.#action = new actionClass() as Action;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.#action as any).realPath = this.mapItem.path;
    }
    return this.#action;
  }

  private getMapItem(): MapItem {
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
    if (otherMethodPathCount) throw this.methodNotAllowedErr;

    throw this.notFoundErr;
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
      .firstOrDefault();
    if (!mostLikePathParts) return;
    return mostLikePathParts.mapItem;
  }

  private removeExtension(name: string): string {
    const dotIndex = name.lastIndexOf(".");
    if (dotIndex > 0) {
      name = name.substr(0, dotIndex);
    }
    return name;
  }

  private get notFoundErr(): ResponseError {
    const msg = `Can't find the path：${this.ctx.req.path}`;
    return new ResponseError(msg).setStatus(StatusCodes.NOT_FOUND).setBody({
      message: msg,
      path: this.ctx.req.path,
    });
  }

  private get methodNotAllowedErr(): ResponseError {
    const msg = `method not allowed：${this.ctx.req.method}`;
    return new ResponseError(msg)
      .setStatus(StatusCodes.METHOD_NOT_ALLOWED)
      .setBody({
        message: msg,
        method: this.ctx.req.method,
        path: this.ctx.req.path,
      });
  }

  private isPathMatched(mapPathStrs: string[], reqUrlStrs: string[]): boolean {
    if (mapPathStrs.length != reqUrlStrs.length) return false;

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
