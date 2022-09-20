import { Context, isNil, isObject, Middleware } from "@ipare/core";
import { Request } from "./context/request";
import { Response } from "./context/response";
import { ResultHandler } from "./context/result-handler";
import { HttpException, InternalServerErrorException } from "./exceptions";

declare module "@ipare/core" {
  interface Context extends ResultHandler {
    get req(): Request;
    get request(): Request;

    get res(): Response;
    get response(): Response;
  }

  interface Middleware extends ResultHandler {
    get req(): Request;
    get request(): Request;

    get res(): Response;
    get response(): Response;
  }
}

if (!("request" in Context.prototype)) {
  Object.defineProperty(Context.prototype, "request", {
    get: function () {
      return (this as Context).req;
    },
  });
  Object.defineProperty(Context.prototype, "response", {
    get: function () {
      return (this as Context).res;
    },
  });

  Context.prototype.catchError = function (err: Error | any): Context {
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

  initHandler(Context.prototype);
}

if (!("req" in Middleware.prototype)) {
  Object.defineProperty(Middleware.prototype, "req", {
    get: function () {
      return (this as Middleware).ctx.req;
    },
  });
  Object.defineProperty(Middleware.prototype, "request", {
    get: function () {
      return (this as Middleware).ctx.req;
    },
  });

  Object.defineProperty(Middleware.prototype, "res", {
    get: function () {
      return (this as Middleware).ctx.res;
    },
  });
  Object.defineProperty(Middleware.prototype, "response", {
    get: function () {
      return (this as Middleware).ctx.res;
    },
  });
  initHandler(Middleware.prototype);
}

function initHandler<
  T extends typeof Context.prototype | typeof Middleware.prototype = any
>(target: T) {
  function setMethods(
    keys: string[],
    source: (target: Context | Middleware) => Request | Response
  ) {
    keys.forEach((key) => {
      target[key] = function (...args: any[]) {
        const src = source(this);
        const result = src[key](...args);
        return result == src ? this : result;
      };
    });
  }

  setMethods(Object.keys(new (ResultHandler as any)()), (target) => target.res);

  setMethods(
    [
      "setHeaders",
      "setHeader",
      "set",
      "appendHeader",
      "append",
      "removeHeader",
      "remove",
    ],
    (target) => target.res
  );

  setMethods(["get", "getHeader", "hasHeader", "has"], (target) => target.req);
}
