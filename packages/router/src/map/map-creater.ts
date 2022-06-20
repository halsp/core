import { isFunction, ObjectConstructor } from "@sfajs/core";
import { existsSync, lstatSync, readdirSync } from "fs";
import path from "path";
import { Action } from "../action";
import { MethodItem } from "../action/method-item";
import { ACTION_METADATA, ACTION_METHOD_METADATA } from "../constant";
import MapItem from "./map-item";
import "reflect-metadata";

export default class MapCreater {
  constructor(private readonly dir: string) {
    if (
      !this.dir ||
      !existsSync(this.dirPath) ||
      !lstatSync(this.dirPath).isDirectory()
    ) {
      throw new Error("The router dir is not exist");
    }
  }

  public create(): MapItem[] {
    return this.readFilesFromFolder("", []);
  }

  private get dirPath(): string {
    return path.join(process.cwd(), this.dir);
  }

  private readFilesFromFolder(folderRePath: string, result: MapItem[]) {
    const storageItems = readdirSync(path.join(this.dirPath, folderRePath)).map(
      (item) => path.join(folderRePath, item)
    );

    const files = this.getFilesModules(storageItems);
    files.forEach((file) => {
      file.modules.forEach((module) => {
        const mapItem = this.createMapItem(
          file.path,
          module.actionName,
          module.action
        );
        result.push(mapItem);
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
        if (!storageItem.endsWith(".js") && !storageItem.endsWith(".ts")) {
          return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const module = require(filePath);
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

  private createMapItem(
    file: string,
    actionName: string,
    action: ObjectConstructor<Action>
  ) {
    const metadata = Reflect.getMetadata(ACTION_METADATA, action) ?? {};

    const decMethods: MethodItem[] = Reflect.getMetadata(
      ACTION_METHOD_METADATA,
      action
    );
    let mapItem: MapItem;
    if (decMethods) {
      const url = decMethods.filter((m) => !!m.url)[0]?.url;
      const methods = decMethods.map((m) => m.method);
      mapItem = new MapItem(file, actionName, url, methods);
    } else {
      mapItem = new MapItem(file, actionName);
    }

    Object.keys(metadata).forEach((key) => {
      if (mapItem[key] == undefined) {
        mapItem[key] = metadata[key];
      }
    });

    return mapItem;
  }
}
