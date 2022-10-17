import { Context, isNil, isObject, Request, Response } from "@ipare/core";
import { CTX_INITED, REQUEST_BODY, REQUEST_PATTERN } from "./constant";
import { MicroException } from "./exception";

export function initContext() {
  if (Context.prototype[CTX_INITED]) {
    return;
  }
  Context.prototype[CTX_INITED] = true;

  Object.defineProperty(Request.prototype, "body", {
    get: function () {
      if (!(REQUEST_BODY in this)) {
        this[REQUEST_BODY] = undefined;
      }
      return this[REQUEST_BODY];
    },
  });
  Request.prototype.setBody = function (val: unknown) {
    this[REQUEST_BODY] = val;
    return this;
  };

  Object.defineProperty(Request.prototype, "pattern", {
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

  Object.defineProperty(Response.prototype, "body", {
    get: function () {
      if (!(REQUEST_BODY in this)) {
        this[REQUEST_BODY] = undefined;
      }
      return this[REQUEST_BODY];
    },
    set: function (val) {
      this[REQUEST_BODY] = val;
    },
  });
  Response.prototype.setBody = function (val: unknown) {
    this[REQUEST_BODY] = val;
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
