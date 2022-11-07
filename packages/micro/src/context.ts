import { Context, isNil, isObject, Request, Response } from "@ipare/core";
import { CTX_INITED, REQUEST_ID, RESPONSE_ERROR } from "./constant";
import { MicroException } from "./exception";
import { parsePattern } from "./pattern";

export function initContext() {
  if (Context.prototype[CTX_INITED]) {
    return;
  }
  Context.prototype[CTX_INITED] = true;

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

  Object.defineProperty(Request.prototype, "pattern", {
    configurable: true,
    enumerable: true,
    get: function () {
      const req = this as Request;
      return parsePattern(req.path);
    },
  });

  Object.defineProperty(Response.prototype, "error", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!(RESPONSE_ERROR in this)) {
        this[RESPONSE_ERROR] = undefined;
      }
      return this[RESPONSE_ERROR];
    },
    set: function (val) {
      this[RESPONSE_ERROR] = val;
    },
  });
  Response.prototype.setError = function (error?: string) {
    this.error = error;
    return this;
  };
}

export function initCatchError(ctx: Context) {
  const catchError = ctx.catchError;
  ctx.catchError = function (err: Error | any): Context {
    if (err instanceof MicroException) {
      this.res.setError(err.message);
    } else if (err instanceof Error) {
      this.catchError(new MicroException(err.message));
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
