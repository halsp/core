import {
  Dict,
  HeadersDict,
  ReadonlyDict,
  ReadonlyHeadersDict,
  normalizePath,
} from "../utils";
import { HttpContext } from "./http-context";
import { HeaderHandler } from "./header-handler";
import { HttpMethod } from "../http-method";

export class Request extends HeaderHandler {
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
  #originalPath = "";
  public get originalPath(): string {
    return this.#originalPath;
  }
  setPath(path: string): this {
    this.#originalPath = path;
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
  #isHeadMethod = false;
  public get isHeadMethod(): boolean {
    return this.#isHeadMethod;
  }
  public get method(): string {
    const ovrdHeader = this.getHeader("X-HTTP-Method-Override");
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

    this.#isHeadMethod = this.#method == HttpMethod.head;
    if (this.#isHeadMethod) {
      this.#method = HttpMethod.get;
    }

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
