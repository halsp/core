import { existsSync, lstatSync } from "fs";
import MapCreater from "./map-creater";
import MapItem from "./map-item";
import { RouterOptionsMerged } from "../router-options";

export default class MapParser {
  constructor(private readonly options: RouterOptionsMerged) {
    if (
      !existsSync(this.options.dir) ||
      !lstatSync(this.options.dir).isDirectory()
    ) {
      throw new Error("The router dir is not exist");
    }
  }

  public getMap(): MapItem[] {
    let map: MapItem[];
    if (this.options.map?.length) {
      map = this.options.map.map((m) => {
        const mapItem = new MapItem(m.path, m.actionName, m.url, [
          ...m.methods,
        ]);
        Object.keys(m).forEach((key) => {
          if (mapItem[key] == undefined) {
            mapItem[key] = m[key];
          }
        });
        return mapItem;
      });
    } else {
      map = new MapCreater(this.options.dir).create();
    }

    if (this.options.decorators) {
      map.forEach((item) => {
        let decorators = this.options.decorators;
        if (typeof decorators == "function") {
          decorators = decorators(item);
        }
        if (decorators?.length) {
          item.extendDecoradors.push(...decorators);
        }
      });
    }

    return map;
  }
}
