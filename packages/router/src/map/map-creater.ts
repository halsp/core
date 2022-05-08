import { isFunction, ObjectConstructor } from "@sfajs/core";
import { writeFileSync, existsSync, lstatSync, readdirSync } from "fs";
import path = require("path");
import { Action } from "../action";
import { MethodItem } from "../action/method-item";
import {
  MAP_FILE_NAME,
  ACTION_METADATA,
  ACTION_METHOD_METADATA,
} from "../constant";
import MapItem from "./map-item";
import "reflect-metadata";

export default class MapCreater {
  constructor(private readonly dir: string) {
    if (
      !this.dir ||
      !existsSync(this.dirPath) ||
      !lstatSync(this.dirPath).isDirectory()
    ) {
      throw new Error("the router dir is not exist");
    }
  }

  get map(): MapItem[] {
    return this.readFilesFromFolder("", []);
  }

  write(filePath: string = MAP_FILE_NAME): void {
    writeFileSync(
      path.join(process.cwd(), filePath.toString()),
      JSON.stringify(
        this.map.map((item) => {
          return {
            ...item,
            path: item.path,
            url: item.url,
            methods: item.methods,
          };
        })
      )
    );
  }

  private get dirPath(): string {
    return path.join(process.cwd(), this.dir);
  }

  private readFilesFromFolder(folderRePath: string, result: MapItem[]) {
    const storageItems = readdirSync(path.join(this.dirPath, folderRePath)).map(
      (item) => path.join(folderRePath, item)
    );

    const files = storageItems
      .filter((storageItem) => {
        const filePath = path.join(this.dirPath, storageItem);
        const stat = lstatSync(filePath);
        if (!stat.isFile()) return false;
        if (!storageItem.endsWith(".js") && !storageItem.endsWith(".ts")) {
          return false;
        }

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const module = require(filePath);
        if (!module || !module.default) return false;
        if (!isFunction(module.default)) return false;
        return module.default.prototype instanceof Action;
      })
      .sort();
    for (let i = 0; i < files.length; i++) {
      const mapItem = this.createMapItem(files[i]);
      result.push(mapItem);
    }

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

  private createMapItem(file: string) {
    const absoluteFilePath = path.join(this.dirPath, file);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const action: ObjectConstructor<Action> = require(absoluteFilePath).default;
    const metadata = Reflect.getMetadata(ACTION_METADATA, action) ?? {};

    const decMethods: MethodItem[] = Reflect.getMetadata(
      ACTION_METHOD_METADATA,
      action
    );
    let mapItem: MapItem;
    if (decMethods) {
      const url = decMethods.filter((m) => !!m.url)[0]?.url;
      const methods = decMethods.map((m) => m.method);
      mapItem = new MapItem(file, url, methods);
    } else {
      mapItem = new MapItem(file);
    }

    Object.keys(metadata).forEach((key) => {
      if (mapItem[key] == undefined) {
        mapItem[key] = metadata[key];
      }
    });

    return mapItem;
  }
}
