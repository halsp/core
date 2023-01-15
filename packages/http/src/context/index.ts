import {
  Context,
  isNil,
  isObject,
  Middleware,
  Request,
  Response,
} from "@ipare/core";
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
      const msg = err.message || undefined;
      ctx.catchError(new InternalServerErrorException(msg));
    } else if (isObject(err)) {
      ctx.catchError(new InternalServerErrorException(err));
    } else {
      const error = (!isNil(err) && String(err)) || undefined;
      ctx.catchError(new InternalServerErrorException(error));
    }

    catchError.call(ctx, err);
    return this;
  };
}
