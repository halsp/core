import {
  HeadersDict,
  HeaderValue,
  NumericalHeadersDict,
  NumericalHeaderValue,
} from "../types";

export interface HeaderHandler {
  setHeaders(headers: NumericalHeadersDict): this;
  setHeader(key: string, value: NumericalHeaderValue): this;
  set(key: string, value: NumericalHeaderValue): this;
  appendHeader(key: string, value: NumericalHeaderValue): this;
  append(key: string, value: NumericalHeaderValue): this;
  hasHeader(key: string): string | false;
  has(key: string): string | false;
  removeHeader(key: string): this;
  remove(key: string): this;
  getHeader<T extends HeaderValue = HeaderValue>(key: string): T | undefined;
  get<T extends HeaderValue = HeaderValue>(key: string): T | undefined;
}

export function initHeaderHandler<T extends HeaderHandler>(
  target: T,
  getHeaders: (this: any) => HeadersDict,
  setHeaders: (this: any) => HeadersDict,
) {
  function getHeaderFromDict<T extends HeaderValue = HeaderValue>(
    key: string,
    dict: HeadersDict,
  ): T | undefined {
    const existKey = hasHeaderFromDict(key, dict);
    if (existKey) {
      return dict[existKey] as T;
    }
  }

  function hasHeaderFromDict(key: string, dict: HeadersDict): string | false {
    for (const item in dict) {
      if (item.toUpperCase() == key.toUpperCase()) {
        return item;
      }
    }
    return false;
  }

  target.setHeader = function (key: string, value: NumericalHeaderValue): T {
    if (value == undefined) return this;

    const headers = setHeaders.bind(this)();
    if (Array.isArray(value)) {
      headers[key] = value.map((item) =>
        typeof item == "string" ? item : String(item),
      );
    } else if (typeof value != "string") {
      headers[key] = String(value);
    } else {
      headers[key] = value;
    }
    return this;
  };
  target.setHeaders = function (headers: NumericalHeadersDict): T {
    for (const key in headers) {
      const value = headers[key];
      if (value != undefined) {
        this.setHeader(key, value);
      }
    }
    return this;
  };
  target.set = function (key: string, value: NumericalHeaderValue): T {
    return this.setHeader(key, value);
  };

  target.appendHeader = function (key: string, value: NumericalHeaderValue): T {
    const prev = getHeaderFromDict(
      key,
      setHeaders.bind(this)(),
    ) as NumericalHeaderValue;
    if (prev) {
      value = (Array.isArray(prev) ? prev : [prev]).concat(value);
    }
    return this.setHeader(key, value);
  };
  target.append = function (key: string, value: NumericalHeaderValue): T {
    return this.appendHeader(key, value);
  };

  target.hasHeader = function (key: string): string | false {
    return hasHeaderFromDict(key, getHeaders.bind(this)());
  };
  target.has = function (key: string): string | false {
    return this.hasHeader(key);
  };

  target.removeHeader = function (key: string): T {
    const headers = setHeaders.bind(this)();
    const existKey = hasHeaderFromDict(key, headers);
    if (existKey) {
      delete headers[existKey];
    }
    return this;
  };
  target.remove = function (key: string): T {
    return this.removeHeader(key);
  };

  target.getHeader = function <U extends HeaderValue = HeaderValue>(
    key: string,
  ): U | undefined {
    return getHeaderFromDict(key, getHeaders.bind(this)());
  };
  target.get = function <U extends HeaderValue = HeaderValue>(
    key: string,
  ): U | undefined {
    return this.getHeader<U>(key);
  };
}
