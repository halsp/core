import { StatusCodes } from "http-status-codes";
import { Response } from "@ipare/core";
import { initResultHandler } from "./result-handler";
import { RESPONSE_BODY, RESPONSE_HEADERS, RESPONSE_STATUS } from "../constant";

export function initResponse(res: typeof Response.prototype) {
  Object.defineProperty(res, "isSuccess", {
    get: function () {
      return this.status >= 200 && this.status < 300;
    },
  });
  Object.defineProperty(res, "headers", {
    get: function () {
      if (!(RESPONSE_HEADERS in this)) {
        this[RESPONSE_HEADERS] = {};
      }
      return this[RESPONSE_HEADERS];
    },
  });

  Object.defineProperty(res, "body", {
    get: function () {
      if (!(RESPONSE_BODY in this)) {
        this[RESPONSE_BODY] = undefined;
      }
      return this[RESPONSE_BODY];
    },
    set: function (val) {
      this[RESPONSE_BODY] = val;
    },
  });
  res.setBody = function (body: unknown) {
    this.body = body;
    return this;
  };

  Object.defineProperty(res, "status", {
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

  initResultHandler(
    res,
    function () {
      return this;
    },
    function () {
      return this.headers;
    },
    function () {
      return this.headers;
    }
  );
}
