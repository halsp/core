import {
  HeadersDict,
  HeaderValue,
  NumericalHeadersDict,
  NumericalHeaderValue,
} from "../utils";

export abstract class HeaderHandler extends Object {
  constructor(getFinder: () => HeadersDict, setFinder?: () => HeadersDict) {
    super();
    this.#getFinder = getFinder;
    this.#setFinder = setFinder ?? getFinder;
  }

  readonly #getFinder: () => HeadersDict;
  readonly #setFinder: () => HeadersDict;

  get #getHeaders(): HeadersDict {
    return this.#getFinder();
  }
  get #setHeaders(): HeadersDict {
    return this.#setFinder();
  }

  setHeaders(headers: NumericalHeadersDict): this {
    for (const key in headers) {
      const value = headers[key];
      if (value != undefined) {
        this.setHeader(key, value);
      }
    }
    return this;
  }
  setHeader(key: string, value: NumericalHeaderValue): this {
    if (value == undefined) return this;

    if (Array.isArray(value)) {
      this.#setHeaders[key] = value.map((item) =>
        typeof item == "string" ? item : String(item)
      );
    } else if (typeof value != "string") {
      this.#setHeaders[key] = String(value);
    } else {
      this.#setHeaders[key] = value;
    }
    return this;
  }
  set(key: string, value: NumericalHeaderValue): this {
    return this.setHeader(key, value);
  }

  appendHeader(key: string, value: NumericalHeaderValue): this {
    const prev = this.#getHeaderFromDict(
      key,
      this.#setHeaders
    ) as NumericalHeaderValue;
    if (prev) {
      value = (Array.isArray(prev) ? prev : [prev]).concat(value);
    }
    return this.setHeader(key, value);
  }
  append(key: string, value: NumericalHeaderValue): this {
    return this.appendHeader(key, value);
  }

  #hasHeaderFromDict(key: string, dict: HeadersDict): string | false {
    for (const item in dict) {
      if (item.toUpperCase() == key.toUpperCase()) {
        return item;
      }
    }
    return false;
  }
  hasHeader(key: string): string | false {
    return this.#hasHeaderFromDict(key, this.#getHeaders);
  }
  has(key: string): string | false {
    return this.hasHeader(key);
  }

  removeHeader(key: string): this {
    const existKey = this.#hasHeaderFromDict(key, this.#setHeaders);
    if (existKey) {
      delete this.#setHeaders[existKey];
    }
    return this;
  }
  remove(key: string): this {
    return this.removeHeader(key);
  }

  #getHeaderFromDict<T extends HeaderValue = HeaderValue>(
    key: string,
    dict: HeadersDict
  ): T | undefined {
    const existKey = this.#hasHeaderFromDict(key, dict);
    if (existKey) {
      return dict[existKey] as T;
    }
  }
  getHeader<T extends HeaderValue = HeaderValue>(key: string): T | undefined {
    return this.#getHeaderFromDict(key, this.#getHeaders);
  }
  get<T extends HeaderValue = HeaderValue>(key: string): T | undefined {
    return this.getHeader<T>(key);
  }
}
