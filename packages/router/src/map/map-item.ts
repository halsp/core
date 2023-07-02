import { normalizePath, ObjectConstructor } from "@halsp/core";
import path from "path";
import { Action } from "../action";
import "reflect-metadata";

export default class MapItem {
  constructor(args: {
    path: string;
    actionName: string;
    url?: string;
    methods?: string[];
    prefix?: string;
    moduleFilePath?: string;
  }) {
    this.moduleFilePath = args.moduleFilePath;
    this.#path = args.path.replace(/\\/g, "/");
    this.#actionName = args.actionName;
    this.#url = this.#formatPrefix(args.prefix) + this.#formatUrl(args.url);
    this.#methods = args.methods ?? this.#getMethodsFromPath();
  }

  readonly #actionName: string;
  public get actionName(): string {
    return this.#actionName;
  }

  readonly #path: string;
  public get path(): string {
    return this.#path;
  }

  private get fileName(): string {
    return this.path.replace(/^.*\//, "");
  }
  private get fileNameWithoutExt(): string {
    return this.fileName.replace(/\.[^\.]+$/, "");
  }

  readonly #url: string;
  public get url(): string {
    return this.#url;
  }

  readonly #methods: string[];
  public get methods(): ReadonlyArray<string> {
    return [...this.#methods] as ReadonlyArray<string>;
  }

  public moduleFilePath?: string;

  #getMethodsFromPath() {
    return this.fileNameWithoutExt
      .split(".")
      .splice(1)
      .filter((item) => !!item)
      .map((item) => item.toUpperCase());
  }

  #formatUrl(url?: string) {
    if (url) {
      if (url.startsWith("//")) {
        return this.#getUrlFromPath() + "/" + normalizePath(url);
      } else {
        return normalizePath(url);
      }
    } else {
      return this.#getUrlFromPath();
    }
  }

  #getUrlFromPath() {
    let filePath = this.path;
    if (this.moduleFilePath) {
      filePath = filePath.replace(/^.+?\//, "");
    }
    const fileName = this.fileName.replace(/\..*$/, "").replace(/^_$/, "");
    const dirPath = filePath.substring(
      0,
      filePath.length - this.fileName.length
    );
    let url = dirPath + fileName;
    if (this.#actionName && this.#actionName != "default") {
      url = path.join(url, this.actionName);
    }
    return normalizePath(url);
  }

  #formatPrefix(prefix?: string) {
    if (!prefix) return "";

    return normalizePath(prefix) + "/";
  }

  [key: string]: any;

  readonly #extendDecoradors: ClassDecorator[] = [];
  public addExtendDecorators(val: ClassDecorator[]) {
    this.#extendDecoradors.push(...val);
  }

  #decoratorsSetted = false;
  public getAction(dir: string): ObjectConstructor<Action> {
    const filePath = path.join(process.cwd(), dir, this.path);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require(filePath);
    const action = module[this.actionName];
    if (this.#extendDecoradors.length && !this.#decoratorsSetted) {
      this.#decoratorsSetted = true;
      Reflect.decorate(this.#extendDecoradors, action);
    }
    return action;
  }

  public get plainObject() {
    return {
      ...this,
      path: this.path,
      url: this.url,
      methods: this.methods,
      actionName: this.actionName,
    };
  }
}
