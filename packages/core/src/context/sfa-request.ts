import {
  Dict,
  HeadersDict,
  ReadonlyDict,
  ReadonlyHeadersDict,
  normalizePath,
} from "../utils";
import { HttpContext } from "./http-context";
import { SfaHeader } from "./sfa-header";

export class Request extends SfaHeader {
  constructor() {
    super(() => this.#headers);
  }

  public readonly ctx!: HttpContext;

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
  setPath(path: string): this {
    this.#path = normalizePath(path);
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
    const ovrdHeader = this.getHeader("X-HTTP-Method-Override");
    if (ovrdHeader) {
      if (typeof ovrdHeader == "string") {
        return ovrdHeader.toUpperCase();
      } else {
        return ovrdHeader[0].toUpperCase();
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
