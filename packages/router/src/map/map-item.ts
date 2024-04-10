import { normalizePath, ObjectConstructor, safeImport } from "@halsp/core";
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
    moduleActionDir?: string;
    realActionsDir?: string;
  }) {
    this.#realActionsDir = args.realActionsDir ?? "";
    this.#moduleActionDir = args.moduleActionDir;
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

  readonly #moduleActionDir?: string;

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

  ignore?: true;

  #getUrlFromPath() {
    let filePath = this.path;
    if (this.#moduleActionDir != undefined) {
      const moduleActionDir = path
        .join(filePath.replace(/\/.*$/, ""), this.#moduleActionDir)
        .replace(/\\/, "/");
      if (!filePath.startsWith(moduleActionDir)) {
        this.ignore = true;
        return "";
      }

      filePath = filePath.substring(moduleActionDir.length, filePath.length);
    }

    const fileName = this.fileName.replace(/\..*$/, "").replace(/^_$/, "");
    const dirPath = filePath.substring(
      0,
      filePath.length - this.fileName.length,
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

  #realActionsDir: string;
  #decoratorsSetted = false;
  public async getAction(): Promise<ObjectConstructor<Action>> {
    const filePath = path.resolve(this.#realActionsDir, this.path);

    const module = await safeImport(filePath);
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
