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
    if (this.options.map?.length) {
      const result: MapItem[] = this.options.map.map((m) => {
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
      return result;
    } else {
      return new MapCreater(this.options.dir).create();
    }
  }
}
