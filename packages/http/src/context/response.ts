import { StatusCodes } from "http-status-codes";
import { Response } from "@ipare/core";
import { initResultHandler } from "./result-handler";
import { RESPONSE_HEADERS, RESPONSE_STATUS } from "../constant";
import { initHeaderHandler } from "./header-handler";

export function initResponse(res: typeof Response.prototype) {
  Object.defineProperty(res, "isSuccess", {
    configurable: true,
    enumerable: true,
    get: function () {
      return this.status >= 200 && this.status < 300;
    },
  });
  Object.defineProperty(res, "headers", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!(RESPONSE_HEADERS in this)) {
        this[RESPONSE_HEADERS] = {};
      }
      return this[RESPONSE_HEADERS];
    },
  });

  Object.defineProperty(res, "status", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!(RESPONSE_STATUS in this)) {
        this[RESPONSE_STATUS] = StatusCodes.NOT_FOUND;
      }
      return this[RESPONSE_STATUS];
    },
    set: function (val) {
      this[RESPONSE_STATUS] = val;
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
