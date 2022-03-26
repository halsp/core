import { writeFileSync, existsSync, lstatSync, readdirSync } from "fs";
import linq from "linq";
import path = require("path");
import Action from "../Action";
import { MAP_FILE_NAME } from "../Constant";
import MapItem from "./MapItem";

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
      JSON.stringify(this.map)
    );
  }

  private get dirPath(): string {
    return path.join(process.cwd(), this.dir);
  }

  private readFilesFromFolder(folderRePath: string, result: MapItem[]) {
    const storageItems = linq
      .from(readdirSync(path.join(this.dirPath, folderRePath)))
      .select((item) => path.join(folderRePath, item))
      .toArray();

    const files = linq
      .from(storageItems)
      .where((storageItem) => {
        const filePath = path.join(this.dirPath, storageItem);
        const stat = lstatSync(filePath);
        if (!stat.isFile()) return false;
        if (!storageItem.endsWith(".js") && !storageItem.endsWith(".ts")) {
          return false;
        }

        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const action = new (require(filePath).default)() as Action;
          return !!action && action instanceof Action;
        } catch (err) {
          return false;
        }
      })
      .orderBy((item) => item)
      .toArray();
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(this.dirPath, files[i]);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const action = new (require(filePath).default)() as Action;
      const mapItem = new MapItem(files[i].replace(/\\/g, "/"));
      Object.assign(mapItem, action.metadata);
      result.push(mapItem);
    }

    const folders = linq
      .from(storageItems)
      .where((storageItem) => {
        const stat = lstatSync(path.join(this.dirPath, storageItem));
        return stat.isDirectory();
      })
      .orderBy((item) => item)
      .toArray();
    for (let i = 0; i < folders.length; i++) {
      this.readFilesFromFolder(folders[i], result);
    }

    return result;
  }
}
