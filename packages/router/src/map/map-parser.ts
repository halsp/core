import { existsSync, lstatSync } from "fs";
import MapCreater from "./map-creater";
import MapItem from "./map-item";
import { RouterOptionsMerged } from "../router-options";
import { RouterModule } from "./module";
import path from "path";

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
        const mapItem = new MapItem({
          path: m.path,
          actionName: m.actionName,
          url: m.url,
          methods: [...m.methods],
        });
        Object.keys(m)
          .filter((k) => mapItem[k] == undefined)
          .forEach((k) => (mapItem[k] = m[k]));
        return mapItem;
      });
    } else {
      map = new MapCreater(this.options.dir).create();
    }

    map.forEach((item) => {
      addDecorators(item, this.options.decorators);

      if (item.moduleFilePath) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const moduleRequire = require(path.resolve(
          this.options.dir,
          item.moduleFilePath
        ));
        const module: RouterModule = moduleRequire.default ?? moduleRequire;
        addDecorators(item, module.decorators);
      }
    });

    return map;
  }
}

const addDecorators = (
  item: MapItem,
  decorators?: ClassDecorator[] | ((mapItem: MapItem) => ClassDecorator[])
) => {
  if (!decorators) {
    return;
  }

  if (typeof decorators == "function") {
    decorators = decorators(item);
  }
  if (decorators?.length) {
    item.addExtendDecorators(decorators);
  }
};
