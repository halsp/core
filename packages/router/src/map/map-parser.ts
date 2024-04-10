import MapCreater from "./map-creater";
import MapItem from "./map-item";
import { RouterOptionsMerged } from "../router-options";
import { getModuleConfig, isModule } from "./module";

export default class MapParser {
  constructor(private readonly options: RouterOptionsMerged) {}

  public async getMap(): Promise<MapItem[]> {
    let map: MapItem[];
    if (this.options.map?.length) {
      map = this.options.map.map((m) => {
        const mapItem = new MapItem({
          path: m.path,
          actionName: m.actionName,
          url: m.url,
          methods: [...m.methods],
          realActionsDir: this.options.dir,
        });
        Object.keys(m)
          .filter((k) => mapItem[k] == undefined)
          .forEach((k) => (mapItem[k] = m[k]));
        return mapItem;
      });
    } else {
      map = await new MapCreater(this.options.dir).create();
    }

    map.forEach((item) => {
      addDecorators(item, this.options.decorators);

      if (isModule(this.options.dir)) {
        const module = getModuleConfig(this.options.dir, item.path);
        addDecorators(item, module?.decorators);
      }
    });

    return map;
  }
}

const addDecorators = (
  item: MapItem,
  decorators?: ClassDecorator[] | ((mapItem: MapItem) => ClassDecorator[]),
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
