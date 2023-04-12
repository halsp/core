import {
  Context,
  isNil,
  isObject,
  Middleware,
  Request,
  Response,
} from "@halsp/core";
import { HttpException, InternalServerErrorException } from "../exceptions";
import { initHeaderHandler } from "./header-handler";
import { initRequest } from "./request";
import { initResponse } from "./response";
import { initResultHandler } from "./result-handler";

export { ResultHandler, initResultHandler } from "./result-handler";
export { HeaderHandler, initHeaderHandler } from "./header-handler";

let inited = false;
export function initContext() {
  if (inited) return;
  inited = true;

  initRequest(Request.prototype);
  initResponse(Response.prototype);

  initResultHandler(Middleware.prototype, function () {
    return this.res;
  });
  initHeaderHandler(
    Middleware.prototype,
    function () {
      return this.req.headers;
    },
    function () {
      return this.res.headers;
    }
  );
}

export function initCatchError(ctx: Context) {
  const catchError = ctx.catchError;
  ctx.catchError = function (err: Error | any): Context {
    if (err instanceof HttpException) {
      ctx.res
        .setHeaders(err.headers)
        .setStatus(err.status)
        .setBody(err.toPlainObject());
    } else if (err instanceof Error) {
      const ex = new InternalServerErrorException(err);
      ex.internal = err;
      ctx.catchError(ex);
    } else if (isObject(err)) {
      const ex = new InternalServerErrorException(err);
      ex.internal = err;
      ctx.catchError(ex);
    } else {
      const error = (!isNil(err) && String(err)) || undefined;
      const ex = new InternalServerErrorException(error);
      ex.internal = err;
      ctx.catchError(ex);
    }

    catchError.call(ctx, err);
    return this;
  };
}
