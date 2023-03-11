import { Dict, normalizePath, ReadonlyDict, Request } from "@halsp/common";
import { HeadersDict, ReadonlyHeadersDict } from "../types";
import { HeaderHandler, initHeaderHandler } from "./header-handler";
import { HttpResponse } from "./response";

export class HttpRequest extends Request<HttpResponse> {
  constructor() {
    super();

    initHeaderHandler(
      this,
      () => this.headers,
      () => this.headers
    );
  }

  readonly #headers: HeadersDict = {};
  get headers(): ReadonlyHeadersDict {
    return this.#headers;
  }

  #body: unknown;
  public get body(): any {
    return this.#body;
  }
  setBody(body: unknown): this {
    this.#body = body;
    return this;
  }

  #path = "";
  public get path(): string {
    return this.#path;
  }
  #originalPath?: string;
  public get originalPath(): string | undefined {
    return this.#originalPath;
  }
  setPath(path: string): this {
    this.#originalPath = path
      ?.replace(/\?.*$/, "")
      ?.replace(/^https?:\/{1,2}[^\/]+/, "");
    this.#path = normalizePath(this.#originalPath);
    return this;
  }

  #method = "ANY";
  public get overrideMethod(): string | undefined {
    if (
      this.#method &&
      this.#method.toUpperCase() != this.method.toUpperCase()
    ) {
      return this.#method;
    }
  }
  public get method(): string {
    const ovrdHeader = this.get("X-HTTP-Method-Override");
    if (ovrdHeader) {
      if (Array.isArray(ovrdHeader)) {
        return ovrdHeader[0].toUpperCase();
      } else {
        return ovrdHeader.toUpperCase();
      }
    }
    return this.#method;
  }
  setMethod(method: string): this {
    this.#method = method?.toUpperCase();
    return this;
  }

  #query: Dict<string> = {};
  get query(): ReadonlyDict<string> {
    return this.#query;
  }
  setQuery(key: string, value: string): this;
  setQuery(query: Dict<string>): this;
  setQuery(key: string | Dict<string>, value?: string): this {
    if (typeof key == "string") {
      this.#query[key] = value ?? "";
    } else {
      const query = key;
      Object.keys(query).forEach((key) => {
        const value = query[key];
        this.setQuery(key, value);
      });
    }
    return this;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HttpRequest extends HeaderHandler {}
