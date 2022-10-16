import "@ipare/micro";
import MapItem from "./map-item";
import { Context } from "@ipare/core";

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

  private getMapItem(): MapItem | undefined {
    const mapItem = this.ctx.routerMap.filter(
      (m) => m.path == this.ctx.msg.pattern
    )[0];
    if (mapItem) return mapItem;

    this.notFound = true;
  }
}