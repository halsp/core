import { Response, Request, createContext, ResultHandler } from "./context";
import { Stream } from "stream";
import * as mime from "mime-types";
import { Context, isString, Middleware, Startup } from "@ipare/core";

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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    export interface ProcessEnv {
      IS_IPARE_HTTP: "true";
    }
  }
}

export abstract class HttpStartup extends Startup {
  constructor() {
    super();
    process.env.IS_IPARE_MICRO = "true";
    initExtends();
  }

  protected async invoke(req: Request | Context): Promise<Response> {
    const ctx = req instanceof Context ? req : createContext(req);
    await super.invoke(ctx);

    this.#setType(ctx.res);
    return ctx.res;
  }

  #setType(res: Response) {
    const body = res.body;

    if (!body) {
      res.removeHeader("content-type");
      res.removeHeader("content-length");
      return res;
    }

    const writeType = !res.hasHeader("content-type");
    const writeLength = !res.hasHeader("content-length");

    if (Buffer.isBuffer(body)) {
      if (writeLength) {
        res.setHeader("content-length", body.byteLength);
      }
      if (writeType) {
        res.setHeader("content-type", mime.contentType("bin") as string);
      }
    } else if (body instanceof Stream) {
      if (writeType) {
        res.setHeader("content-type", mime.contentType("bin") as string);
      }
    } else if (isString(body)) {
      if (writeLength) {
        res.setHeader("content-length", Buffer.byteLength(body));
      }
      if (writeType) {
        const type = /^\s*</.test(body) ? "html" : "text";
        res.setHeader("content-type", mime.contentType(type) as string);
      }
    } else {
      if (writeLength) {
        res.setHeader(
          "content-length",
          Buffer.byteLength(JSON.stringify(body))
        );
      }
      if (writeType) {
        res.setHeader("content-type", mime.contentType("json") as string);
      }
    }

    return res;
  }
}

function initExtends() {
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

    setMethods(
      Object.keys(new (ResultHandler as any)()),
      (target) => target.res
    );

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

    setMethods(
      ["get", "getHeader", "hasHeader", "has"],
      (target) => target.req
    );
  }
}
