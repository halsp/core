import { writeFileSync, lstatSync, readdirSync } from "fs";
import linq = require("linq");
import path = require("path");
import Action from "../../Action";
import ApiDocsConfig from "../ApiDocsConfig";
import ApiDocsMdActionCreater from "./ApiDocsMdActionCreater";
import ApiDocsNoteParser from "../ApiDocsNoteParser";
import ApiDocsMdPart from "./ApiDocsMdPart";
import Config, { AppConfig } from "../../Config";

export default class ApiDocsCreater {
  constructor(private readonly config: AppConfig) {}

  get docConfig(): ApiDocsConfig {
    if (!this.config.doc) {
      throw new Error("there is no doc config");
    }
    return this.config.doc;
  }

  get docs(): string {
    const part = new ApiDocsMdPart(this.docConfig);
    let result = part.title;
    result += this.readFilesFromFolder("");
    if (result.endsWith(part.separation)) {
      result = result.substr(0, result.length - part.separation.length);
    }
    result += part.tail;
    return result;
  }

  public write(targetFile: string): void {
    if (!targetFile) {
      throw new Error(
        "please input target file path, for example 'docs/api.md'"
      );
    }

    writeFileSync(path.join(process.cwd(), targetFile), this.docs);
  }

  private readFilesFromFolder(folderRPath: string): string {
    let result = "";
    const storageItems = linq
      .from(readdirSync(path.join(this.routerDir, folderRPath)))
      .select((item) => path.join(folderRPath, item))
      .toArray();

    const files = linq
      .from(storageItems)
      .where((storageItem) => {
        const stat = lstatSync(path.join(this.routerDir, storageItem));
        return (
          stat.isFile() &&
          (storageItem.endsWith(".js") || storageItem.endsWith(".ts"))
        );
      })
      .orderBy((item) => item)
      .toArray();
    for (let i = 0; i < files.length; i++) {
      const readFileResult = this.readFile(files[i]);
      if (readFileResult) {
        result += readFileResult;
        result += new ApiDocsMdPart(this.docConfig).separation;
      }
    }

    const folders = linq
      .from(storageItems)
      .where((storageItem) => {
        const stat = lstatSync(path.join(this.routerDir, storageItem));
        return stat.isDirectory();
      })
      .orderBy((item) => item)
      .toArray();
    for (let i = 0; i < folders.length; i++) {
      result += this.readFilesFromFolder(folders[i]);
    }

    return result;
  }

  private get routerDir(): string {
    return Config.getRouterDirPath(this.config);
  }

  private readFile(rPath: string): string {
    const file = path.join(process.cwd(), this.routerDir, rPath);
    let action: Action;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const actionClass = require(file).default;
      action = new actionClass();
      if (!(action instanceof Action)) {
        return "";
      }
    } catch (err) {
      return "";
    }

    let docs;
    if (action.docs) {
      docs = action.docs;
    } else {
      docs = new ApiDocsNoteParser(file).docs;
    }
    if (!docs) return "";

    return new ApiDocsMdActionCreater(rPath, docs, this.docConfig, action)
      .result;
  }
}
