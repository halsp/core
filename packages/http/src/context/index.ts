import {
  Context,
  isNil,
  isObject,
  Middleware,
  Request,
  Response,
} from "@ipare/core";
import { CTX_INITED } from "../constant";
import { HttpException, InternalServerErrorException } from "../exceptions";
import { initRequest } from "./request";
import { initResponse } from "./response";
import { initResultHandler } from "./result-handler";

export { ResultHandler, initResultHandler } from "./result-handler";
export { HeaderHandler, initHeaderHandler } from "./header-handler";

export function initContext() {
  if (Context.prototype[CTX_INITED]) {
    return;
  }
  Context.prototype[CTX_INITED] = true;

  initRequest(Request.prototype);
  initResponse(Response.prototype);

  initResultHandler(
    Context.prototype,
    function () {
      return this.res;
    },
    function () {
      return this.req.headers;
    },
    function () {
      return this.res.headers;
    }
  );

  initResultHandler(
    Middleware.prototype,
    function () {
      return this.res;
    },
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
      ctx
        .setHeaders(err.headers)
        .res.setStatus(err.status)
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
