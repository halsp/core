import * as SfaTypes from "../types";
import HeadersHandler from "../HeadersHandler";
import { HeadersDict, ReadonlyHeadersDict } from "../types";
import HttpMethod from "./HttpMethod";

export default class Request extends HeadersHandler {
  constructor() {
    super(() => this.#headers);
  }

  #headers: HeadersDict = {};
  get headers(): ReadonlyHeadersDict {
    return this.#headers;
  }

  #body: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get body(): any {
    return this.#body;
  }
  setBody(body: unknown): Request {
    this.#body = body;
    return this;
  }

  #path = "";
  public get path(): string {
    return this.#path;
  }
  setPath(path: string): Request {
    if (!!path && (path.startsWith("/") || path.startsWith("\\"))) {
      this.#path = path.substr(1, path.length - 1);
    } else {
      this.#path = path;
    }
    return this;
  }

  #method = HttpMethod.any;
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
  setMethod(method: string): Request {
    this.#method = method?.toUpperCase();
    return this;
  }

  #query: SfaTypes.Dict<string> = {};
  get query(): NodeJS.ReadOnlyDict<string> {
    return this.#query;
  }
  setQuery(key: string, value: string): Request;
  setQuery(query: SfaTypes.Dict<string>): Request;
  setQuery(key: string | SfaTypes.Dict<string>, value?: string): Request {
    if (typeof key == "string") {
      this.#query[key] = value ?? "";
    } else {
      Object.keys(key).forEach((item) => {
        const value = key[item];
        this.setQuery(item, value);
      });
    }
    return this;
  }
}
