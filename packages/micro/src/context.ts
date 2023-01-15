import { Context, isNil, isObject, Request, Response } from "@ipare/core";
import { MicroException } from "./exception";

let inited = false;
export function initContext() {
  if (inited) return;
  inited = true;

  const idMap = new WeakMap<Request, string>();
  Object.defineProperty(Request.prototype, "id", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!idMap.has(this)) {
        idMap.set(this, "");
      }
      return idMap.get(this);
    },
  });
  Request.prototype.setId = function (id: string) {
    idMap.set(this, id);
    return this;
  };

  Object.defineProperty(Request.prototype, "pattern", {
    configurable: true,
    enumerable: true,
    get: function () {
      const req = this as Request;
      return req.path;
    },
  });

  const errorMap = new WeakMap<Response, string | undefined>();
  Object.defineProperty(Response.prototype, "error", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (!errorMap.has(this)) {
        errorMap.set(this, undefined);
      }
      return errorMap.get(this);
    },
    set: function (val) {
      errorMap.set(this, val);
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
