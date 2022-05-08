import { HttpMethod, normalizePath } from "@sfajs/core";

export default class MapItem {
  constructor(path: string, url?: string, methods?: HttpMethod[]) {
    this.#path = path.replace(/\\/g, "/");
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

  readonly #methods: HttpMethod[];
  public get methods(): ReadonlyArray<HttpMethod> {
    return [...this.#methods] as ReadonlyArray<HttpMethod>;
  }

  #getMethodsFromPath() {
    return this.fileNameWithoutExt
      .split(".")
      .splice(1)
      .filter((item) => !!item)
      .map((item) => item.toUpperCase());
  }

  #getUrlFromPath() {
    const actionName = this.fileName.replace(/\..*$/, "").replace(/^_$/, "");
    const pPath = this.path.substr(0, this.path.length - this.fileName.length);
    return normalizePath(pPath + actionName);
  }

  [key: string]: any;
}
