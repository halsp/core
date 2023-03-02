import { StatusCodes } from "http-status-codes";
import { Response } from "@halsp/common";
import { initResultHandler } from "./result-handler";
import { initHeaderHandler } from "./header-handler";
import { ReadonlyHeadersDict } from "../types";

export function initResponse(res: typeof Response.prototype) {
  Object.defineProperty(res, "isSuccess", {
    configurable: true,
    enumerable: true,
    get: function () {
      return this.status >= 200 && this.status < 300;
    },
  });

  const headersMap = new WeakMap<Response, ReadonlyHeadersDict>();
  Object.defineProperty(res, "headers", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!headersMap.has(this)) {
        headersMap.set(this, {});
      }
      return headersMap.get(this);
    },
  });

  const statusMap = new WeakMap<Response, number>();
  Object.defineProperty(res, "status", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!statusMap.has(this)) {
        statusMap.set(this, StatusCodes.NOT_FOUND);
      }
      return statusMap.get(this);
    },
    set: function (val) {
      statusMap.set(this, val);
    },
  });
  res.setStatus = function (status: number) {
    this.status = status;
    return this;
  };

  initResultHandler(res, function () {
    return this;
  });
  initHeaderHandler(
    res,
    function () {
      return this.headers;
    },
    function () {
      return this.headers;
    }
  );
}
