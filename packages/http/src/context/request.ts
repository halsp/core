import { Dict, ReadonlyDict, Request } from "@ipare/core";
import { HttpMethods } from "@ipare/methods";
import { initHeaderHandler } from "./header-handler";
import { ReadonlyHeadersDict } from "../types";

export function initRequest(req: typeof Request.prototype) {
  const headersMap = new WeakMap<Request, ReadonlyHeadersDict>();
  Object.defineProperty(req, "headers", {
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
  Object.defineProperty(req, "overrideMethod", {
    configurable: true,
    enumerable: true,
    get: function () {
      const method = methodMap.get(this);

      if (method && method.toUpperCase() != this.method.toUpperCase()) {
        return method;
      }
    },
  });

  Object.defineProperty(req, "method", {
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
  req.setMethod = function (val: string) {
    methodMap.set(this, val?.toUpperCase());
    return this;
  };

  const queryMap = new WeakMap<Request, ReadonlyDict<string>>();
  Object.defineProperty(req, "query", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!queryMap.has(this)) {
        queryMap.set(this, {});
      }
      return queryMap.get(this);
    },
  });
  req.setQuery = function (
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
    req,
    function () {
      return this.headers;
    },
    function () {
      return this.headers;
    }
  );
}
