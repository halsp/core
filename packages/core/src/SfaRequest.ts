import SfaHeader, {
  Dict,
  HeadersDict,
  ReadonlyDict,
  ReadonlyHeadersDict,
} from "@sfajs/header";

export default class SfaRequest extends SfaHeader {
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
  setBody(body: unknown): this {
    this.#body = body;
    return this;
  }

  #path = "";
  public get path(): string {
    return this.#path;
  }
  setPath(path: string): this {
    if (!!path && (path.startsWith("/") || path.startsWith("\\"))) {
      this.#path = path.substr(1, path.length - 1);
    } else {
      this.#path = path;
    }
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
