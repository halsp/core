import { Stream } from "stream";
import * as mime from "mime-types";
import {
  HookType,
  isNil,
  isObject,
  isString,
  Response,
  Startup,
} from "@halsp/core";
import { HttpException, InternalServerErrorException } from "./exceptions";

declare module "@halsp/core" {
  interface Startup {
    useHttp(): this;
  }
}

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useHttp = function () {
  if (usedMap.get(this)) {
    return this;
  }
  usedMap.set(this, true);

  process.env.HALSP_ENV = "http";

  return this.use(async (ctx, next) => {
    await next();
    setType(ctx.res);
  }).hook(HookType.Unhandled, (ctx, md, error) => {
    const catchError = (err: Error | any) => {
      if (err instanceof HttpException) {
        ctx.res
          .setHeaders(err.headers)
          .setStatus(err.status)
          .setBody(err.toPlainObject());
      } else if (err instanceof Error) {
        const msg = err.message || undefined;
        const ex = new InternalServerErrorException(msg);
        ex.inner = err;
        catchError(ex);
      } else if (isObject(err)) {
        const ex = new InternalServerErrorException(err);
        ex.inner = err;
        catchError(ex);
      } else {
        const error = (!isNil(err) && String(err)) || undefined;
        const ex = new InternalServerErrorException(error);
        ex.inner = err;
        catchError(ex);
      }
    };
    catchError(error);
  });
};

function setType(res: Response) {
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
      res.setHeader("content-length", Buffer.byteLength(JSON.stringify(body)));
    }
    if (writeType) {
      res.setHeader("content-type", mime.contentType("json") as string);
    }
  }

  return res;
}
