import { Context, isNil, isObject, Request, Response } from "@ipare/core";
import {
  CTX_INITED,
  REQUEST_ID,
  REQUEST_PATTERN,
  RESPONSE_STATUS,
} from "./constant";
import { MicroException } from "./exception";

export function initContext() {
  if (Context.prototype[CTX_INITED]) {
    return;
  }
  Context.prototype[CTX_INITED] = true;

  Object.defineProperty(Request.prototype, "pattern", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!(REQUEST_PATTERN in this)) {
        this[REQUEST_PATTERN] = "";
      }
      return this[REQUEST_PATTERN];
    },
  });
  Request.prototype.setPattern = function (val: string): Request {
    this[REQUEST_PATTERN] = val ?? "";
    return this;
  };

  Object.defineProperty(Request.prototype, "id", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!(REQUEST_ID in this)) {
        this[REQUEST_ID] = "";
      }
      return this[REQUEST_ID];
    },
  });
  Request.prototype.setId = function (id: string) {
    this[REQUEST_ID] = id;
    return this;
  };

  Object.defineProperty(Response.prototype, "status", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!(RESPONSE_STATUS in this)) {
        this[RESPONSE_STATUS] = undefined;
      }
      return this[RESPONSE_STATUS];
    },
    set: function (val) {
      this[RESPONSE_STATUS] = val;
    },
  });
  Response.prototype.setStatus = function (status?: string) {
    this.status = status;
    return this;
  };
}

export function initCatchError(ctx: Context) {
  const catchError = ctx.catchError;
  ctx.catchError = function (err: Error | any): Context {
    if (err instanceof MicroException) {
      this.res.body = err.toPlainObject();
    } else if (err instanceof Error) {
      const msg = err.message || undefined;
      this.catchError(new MicroException(msg));
    } else if (isObject(err)) {
      this.catchError(new MicroException(err));
    } else {
      const error = (!isNil(err) && String(err)) || undefined;
      this.catchError(new MicroException(error));
    }

    catchError.call(ctx, err);
    return this;
  };
}
