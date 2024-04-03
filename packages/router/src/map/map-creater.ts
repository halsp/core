import { isFunction, ObjectConstructor } from "@halsp/core";
import { existsSync, lstatSync, readdirSync } from "fs";
import path from "path";
import { Action, getActionMetadata } from "../action";
import { MethodItem } from "../action/method-item";
import { ACTION_METHOD_METADATA, ACTION_PATTERN_METADATA } from "../constant";
import MapItem from "./map-item";
import "reflect-metadata";
import { getModuleConfig, isModule } from "./module";

export default class MapCreater {
  constructor(private readonly dir: string) {}

  public create(): MapItem[] {
    if (
      !this.dir ||
      !existsSync(this.dirPath) ||
      !lstatSync(this.dirPath).isDirectory()
    ) {
      return [];
    }

    return this.readFilesFromFolder("", []);
  }

  private get dirPath(): string {
    return path.resolve(process.cwd(), this.dir);
  }

  private readFilesFromFolder(folderRePath: string, result: MapItem[]) {
    const storageItems = readdirSync(path.join(this.dirPath, folderRePath)).map(
      (item) => path.join(folderRePath, item),
    );

    const files = this.getFilesModules(storageItems);
    files.forEach((file) => {
      file.modules.forEach((module) => {
        const mapItems = this.createMapItems(
          file.path,
          module.actionName,
          module.action,
        );
        result.push(...mapItems);
      });
    });

    const folders = storageItems
      .filter((storageItem) => {
        const stat = lstatSync(path.join(this.dirPath, storageItem));
        return stat.isDirectory();
      })
      .sort();
    for (let i = 0; i < folders.length; i++) {
      this.readFilesFromFolder(folders[i], result);
    }

    return result;
  }

  private getFilesModules(files: string[]) {
    return files
      .map((storageItem) => {
        const filePath = path.join(this.dirPath, storageItem);
        const stat = lstatSync(filePath);
        if (!stat.isFile()) return null;
        if (storageItem.endsWith(".d.ts")) {
          return null;
        }
        if (!storageItem.match(/\.(m|c)?(j|t)s$/)) {
          return null;
        }

        const module = _require(filePath);
        const modules = Object.keys(module)
          .map((actionName) => {
            const action: ObjectConstructor<Action> = module[actionName];
            if (isFunction(action) && action.prototype instanceof Action) {
              return {
                action,
                actionName,
              };
            } else {
              return null;
            }
          })
          .filter((item) => !!item)
          .map((item) => item as Exclude<typeof item, null>);
        return {
          modules,
          path: storageItem,
        };
      })
      .filter((item) => !!item)
      .map((item) => item as Exclude<typeof item, null>);
  }

  private createMapItems(
    file: string,
    actionName: string,
    action: ObjectConstructor<Action>,
  ) {
    const mapItems: MapItem[] = [];

    const isItemModule = isModule(this.dir);
    let prefix: string | undefined;
    let deepDir: string | undefined;
    if (isItemModule) {
      const moduleConfig = getModuleConfig(this.dir, file);
      prefix = moduleConfig?.prefix;
      deepDir = moduleConfig?.deepDir ?? "";
    }

    // http
    const decMethods: MethodItem[] =
      Reflect.getMetadata(ACTION_METHOD_METADATA, action.prototype) ?? [];
    decMethods.forEach((method) => {
      mapItems.push(
        new MapItem({
          path: file,
          actionName,
          url: method.url,
          methods: [method.method],
          prefix,
          moduleActionDir: deepDir,
          realActionsDir: this.dir,
        }),
      );
    });

    // micro
    const decPatterns: string[] =
      Reflect.getMetadata(ACTION_PATTERN_METADATA, action.prototype) ?? [];
    decPatterns.forEach((pattern) => {
      mapItems.push(
        new MapItem({
          path: file,
          actionName,
          url: pattern,
          methods: [],
          prefix,
          moduleActionDir: deepDir,
          realActionsDir: this.dir,
        }),
      );
    });

    // default
    if (!mapItems.length) {
      mapItems.push(
        new MapItem({
          path: file,
          actionName,
          prefix,
          moduleActionDir: deepDir,
          realActionsDir: this.dir,
        }),
      );
    }

    const metadata = getActionMetadata(action);
    if (metadata) {
      mapItems.forEach((mapItem) =>
        Object.keys(metadata)
          .filter((k) => !(k in mapItem))
          .forEach((k) => (mapItem[k] = metadata[k])),
      );
    }

    return mapItems.filter((item) => !item.ignore);
  }
}
