import { Dict, normalizePath, Request } from "@ipare/core";
import { initHeaderHandler } from "./header-handler";
import { HttpMethod } from "../http-method";
import {
  REQUEST_BODY,
  REQUEST_HEADERS,
  REQUEST_METHOD,
  REQUEST_ORIGINAL_PATH,
  REQUEST_PATH,
  REQUEST_QUERY,
} from "../constant";

export function initRequest(req: typeof Request.prototype) {
  Object.defineProperty(req, "headers", {
    get: function () {
      if (!(REQUEST_HEADERS in this)) {
        this[REQUEST_HEADERS] = {};
      }
      return this[REQUEST_HEADERS];
    },
  });

  Object.defineProperty(req, "body", {
    get: function () {
      if (!(REQUEST_BODY in this)) {
        this[REQUEST_BODY] = undefined;
      }
      return this[REQUEST_BODY];
    },
  });
  req.setBody = function (val: unknown) {
    this[REQUEST_BODY] = val;
    return this;
  };

  Object.defineProperty(req, "path", {
    get: function () {
      if (!(REQUEST_PATH in this)) {
        this[REQUEST_PATH] = "";
      }
      return this[REQUEST_PATH];
    },
  });
  Object.defineProperty(req, "originalPath", {
    get: function () {
      if (!(REQUEST_ORIGINAL_PATH in this)) {
        this[REQUEST_ORIGINAL_PATH] = undefined;
      }
      return this[REQUEST_ORIGINAL_PATH];
    },
  });
  req.setPath = function (val: string): Request {
    this[REQUEST_ORIGINAL_PATH] = val
      ?.replace(/\?.*$/, "")
      ?.replace(/^https?:\/{1,2}[^\/]+\//, "");
    this[REQUEST_PATH] = normalizePath(this[REQUEST_ORIGINAL_PATH]);
    return this;
  };

  Object.defineProperty(req, "overrideMethod", {
    get: function () {
      const method = this[REQUEST_METHOD] as string;

      if (method && method.toUpperCase() != this.method.toUpperCase()) {
        return method;
      }
    },
  });

  Object.defineProperty(req, "method", {
    get: function () {
      if (!(REQUEST_METHOD in this)) {
        this[REQUEST_METHOD] = HttpMethod.any;
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
