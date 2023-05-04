import { Dict, ReadonlyDict, Request } from "@halsp/core";
import { HttpMethods } from "@halsp/methods";
import { HeaderHandler, initHeaderHandler } from "./header-handler";
import { ReadonlyHeadersDict } from "../types";

declare module "@halsp/core" {
  interface Request extends HeaderHandler {
    get headers(): ReadonlyHeadersDict;

    get overrideMethod(): string | undefined;
    get method(): string;
    setMethod(method: string): this;

    get query(): ReadonlyDict<string>;
    setQuery(key: string, value: string): this;
    setQuery(query: Dict<string>): this;
  }
}

const headersMap = new WeakMap<Request, ReadonlyHeadersDict>();
Object.defineProperty(Request.prototype, "headers", {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!headersMap.has(this)) {
      headersMap.set(this, {});
    }
    return headersMap.get(this);
  },
});

const methodMap = new WeakMap<Request, string>();
Object.defineProperty(Request.prototype, "overrideMethod", {
  configurable: true,
  enumerable: true,
  get: function () {
    const method = methodMap.get(this);

    if (method && method.toUpperCase() != this.method.toUpperCase()) {
      return method;
    }
  },
});

Object.defineProperty(Request.prototype, "method", {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!methodMap.has(this)) {
      methodMap.set(this, HttpMethods.any);
    }

    const ovrdHeader = this.getHeader("X-HTTP-Method-Override");
    if (ovrdHeader) {
      if (Array.isArray(ovrdHeader)) {
        return ovrdHeader[0].toUpperCase();
      } else {
        return ovrdHeader.toUpperCase();
      }
    }
    return methodMap.get(this);
  },
});
Request.prototype.setMethod = function (val: string) {
  methodMap.set(this, val?.toUpperCase());
  return this;
};

const queryMap = new WeakMap<Request, ReadonlyDict<string>>();
Object.defineProperty(Request.prototype, "query", {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!queryMap.has(this)) {
      queryMap.set(this, {});
    }
    return queryMap.get(this);
  },
});
Request.prototype.setQuery = function (
  key: string | Dict<string>,
  value?: string
): Request {
  const query = this.query as Dict<string>;
  if (typeof key == "string") {
    query[key] = value ?? "";
  } else {
    const query = key;
    Object.keys(query).forEach((key) => {
      const value = query[key];
      this.setQuery(key, value);
    });
  }
  return this;
};

initHeaderHandler(
  Request.prototype,
  function () {
    return this.headers;
  },
  function () {
    return this.headers;
  }
);
