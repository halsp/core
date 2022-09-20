import { Context, isNil, isObject } from "@ipare/core";
import { HttpException, InternalServerErrorException } from "../exceptions";
import { Request } from "./request";
import { Response } from "./response";

export * from "./response";
export * from "./request";
export * from "./result-handler";
export * from "./header-handler";

export function createContext(req?: Request) {
  const ctx = new Context();
  const res = new Response();
  req = req ?? new Request();

  Object.defineProperty(ctx, "req", {
    get: () => req,
  });
  Object.defineProperty(ctx, "res", {
    get: () => res,
  });
  Object.defineProperty(ctx.req, "ctx", {
    get: () => ctx,
  });
  Object.defineProperty(ctx.res, "ctx", {
    get: () => ctx,
  });

  ctx.catchError = function (err: Error | any): Context {
    if (err instanceof HttpException) {
      this.errorStack.push(err);
      this.setHeaders(err.header.headers)
        .res.setStatus(err.status)
        .setBody(err.toPlainObject());
    } else if (err instanceof Error) {
      this.errorStack.push(err);
      const msg = err.message || undefined;
      this.catchError(new InternalServerErrorException(msg));
    } else if (isObject(err)) {
      this.errorStack.push(err);
      this.catchError(new InternalServerErrorException(err));
    } else {
      this.errorStack.push(err);
      const error = (!isNil(err) && String(err)) || undefined;
      this.catchError(new InternalServerErrorException(error));
    }
    return this;
  };

  return ctx;
}
