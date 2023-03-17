import { normalizePath, ObjectConstructor } from "@halsp/core";
import path from "path";
import { Action } from "../action";

export default class MapItem {
  constructor(
    path: string,
    actionName: string,
    url?: string,
    methods?: string[]
  ) {
    this.#path = path.replace(/\\/g, "/");
    this.#actionName = actionName;
    if (url) {
      if (url.startsWith("//")) {
        this.#url = this.#getUrlFromPath() + "/" + normalizePath(url);
      } else {
        this.#url = normalizePath(url);
      }
    } else {
      this.#url = this.#getUrlFromPath();
    }
    this.#methods = methods ?? this.#getMethodsFromPath();
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

  #getMethodsFromPath() {
    return this.fileNameWithoutExt
      .split(".")
      .splice(1)
      .filter((item) => !!item)
      .map((item) => item.toUpperCase());
  }

  #getUrlFromPath() {
    const fileName = this.fileName.replace(/\..*$/, "").replace(/^_$/, "");
    const pPath = this.path.substr(0, this.path.length - this.fileName.length);
    let url = pPath + fileName;
    if (this.#actionName && this.#actionName != "default") {
      url += "/" + this.#actionName;
    }
    return normalizePath(url);
  }

  [key: string]: any;

  public getAction(dir: string): ObjectConstructor<Action> {
    const filePath = path.join(process.cwd(), dir, this.path);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require(filePath);
    const action = module[this.actionName];
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
