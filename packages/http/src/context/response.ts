import { StatusCodes } from "http-status-codes";
import { Response } from "@halsp/core";
import { initResultHandler, ResultHandler } from "./result-handler";
import { HeaderHandler, initHeaderHandler } from "./header-handler";
import { ReadonlyHeadersDict } from "../types";

declare module "@halsp/core" {
  interface Response extends ResultHandler, HeaderHandler {
    get isSuccess(): boolean;
    get headers(): ReadonlyHeadersDict;

    get status(): number;
    set status(val: number);
    setStatus(status: StatusCodes): this;
  }
}

Object.defineProperty(Response.prototype, "isSuccess", {
  configurable: true,
  enumerable: true,
  get: function () {
    return this.status >= 200 && this.status < 300;
  },
});

const headersMap = new WeakMap<Response, ReadonlyHeadersDict>();
Object.defineProperty(Response.prototype, "headers", {
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
Object.defineProperty(Response.prototype, "status", {
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
Response.prototype.setStatus = function (status: number) {
  this.status = status;
  return this;
};

initResultHandler(Response.prototype, function () {
  return this;
});
initHeaderHandler(
  Response.prototype,
  function () {
    return this.headers;
  },
  function () {
    return this.headers;
  },
);
