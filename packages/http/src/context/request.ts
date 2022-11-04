import { Dict, Request } from "@ipare/core";
import { HttpMethods } from "@ipare/methods";
import { initHeaderHandler } from "./header-handler";
import { REQUEST_HEADERS, REQUEST_METHOD, REQUEST_QUERY } from "../constant";

export function initRequest(req: typeof Request.prototype) {
  Object.defineProperty(req, "headers", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!(REQUEST_HEADERS in this)) {
        this[REQUEST_HEADERS] = {};
      }
      return this[REQUEST_HEADERS];
    },
  });

  Object.defineProperty(req, "overrideMethod", {
    configurable: true,
    enumerable: true,
    get: function () {
      const method = this[REQUEST_METHOD] as string;

      if (method && method.toUpperCase() != this.method.toUpperCase()) {
        return method;
      }
    },
  });

  Object.defineProperty(req, "method", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!(REQUEST_METHOD in this)) {
        this[REQUEST_METHOD] = HttpMethods.any;
      }

      const ovrdHeader = this.getHeader("X-HTTP-Method-Override");
      if (ovrdHeader) {
        if (Array.isArray(ovrdHeader)) {
          return ovrdHeader[0].toUpperCase();
        } else {
          return ovrdHeader.toUpperCase();
        }
      }
      return this[REQUEST_METHOD];
    },
  });
  req.setMethod = function (val: string) {
    this[REQUEST_METHOD] = val?.toUpperCase();
    return this;
  };

  Object.defineProperty(req, "query", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!(REQUEST_QUERY in this)) {
        this[REQUEST_QUERY] = {};
      }
      return this[REQUEST_QUERY];
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
