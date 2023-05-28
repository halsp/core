import MapItem from "./map-item";
import { Context } from "@halsp/core";

const anyMethod = "ANY";

export class MapMatcher {
  constructor(private readonly ctx: Context) {
    const mapItem = this.getMapItem();
    if (mapItem) {
      this.#mapItem = mapItem;
    }
  }

  #mapItem!: MapItem;
  public get mapItem(): MapItem {
    return this.#mapItem;
  }

  public notFound = false;
  public methodNotAllowed = false;

  private getMapItem(): MapItem | undefined {
    const matchedPaths = this.ctx.routerMap
      .filter((m) => !!m.methods.length)
      .filter((m) => this.isPathMatched(m, true));
    this.ctx.routerMap
      .filter((m) => !m.methods.length || m.methods.includes(anyMethod))
      .filter((m) => this.isPathMatched(m, false))
      .forEach((m) => matchedPaths.push(m));
    const mapItem = this.getMostLikeMapItem(matchedPaths);
    if (mapItem) return mapItem;

    const otherMethodPathCount = this.ctx.routerMap.filter((m) =>
      this.isPathMatched(m, false)
    ).length;
    if (otherMethodPathCount) {
      this.methodNotAllowed = true;
    } else {
      this.notFound = true;
    }
  }

  private isPathMatched(mapItem: MapItem, methodIncluded: boolean): boolean {
    const options = this.ctx.routerOptions;

    let reqUrl = this.ctx.req.path;
    if (options.prefix) {
      if (!reqUrl.startsWith(options.prefix)) {
        return false;
      }

      reqUrl = reqUrl
        .substring(options.prefix.length, reqUrl.length)
        .replace(/^\//, "");
    }
    const reqUrlStrs = reqUrl
      .toLowerCase()
      .split("/")
      .filter((item) => !!item);
    const mapUrlStrs = mapItem.url
      .toLowerCase()
      .split("/")
      .filter((item) => !!item);
    if (reqUrlStrs.length != mapUrlStrs.length) return false;

    if (methodIncluded && !mapItem.methods.includes(anyMethod)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { HttpMethods } = require("@halsp/http");
      const matchedMethod = HttpMethods.matched(
        this.ctx.req["method"],
        options.customMethods
      );
      if (!matchedMethod || !mapItem.methods.includes(matchedMethod)) {
        return false;
      }
    }

    for (let i = 0; i < mapUrlStrs.length; i++) {
      if (mapUrlStrs[i] != reqUrlStrs[i] && !mapUrlStrs[i].startsWith("^")) {
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
        parts: mapItem.url
          .toLowerCase()
          .split("/")
          .filter((item) => !!item),
      });
    });

    const minPartsCount = Math.min(...pathsParts.map((pp) => pp.parts.length));
    for (let i = 0; i < minPartsCount; i++) {
      if (
        pathsParts.some((p) => p.parts[i].includes("^")) &&
        pathsParts.some((p) => !p.parts[i].includes("^"))
      ) {
        pathsParts
          .filter((p) => p.parts[i].includes("^"))
          .forEach((p) => pathsParts.splice(pathsParts.indexOf(p), 1));
      }

      if (pathsParts.length == 1) return pathsParts[0].mapItem;
    }

    if (
      pathsParts.some((pp) => pp.mapItem.methods.includes(anyMethod)) &&
      pathsParts.some((pp) => !pp.mapItem.methods.includes(anyMethod))
    ) {
      pathsParts
        .filter((pp) => pp.mapItem.methods.includes(anyMethod))
        .forEach((pp) => {
          pathsParts.splice(pathsParts.indexOf(pp), 1);
        });
    }

    return pathsParts.sort((a, b) => a.parts.length - b.parts.length)[0]
      .mapItem;
  }
}
