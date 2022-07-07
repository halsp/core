import { SfaResponse, HttpContext } from "../context";
import {
  Middleware,
  MdHook,
  HookMiddleware,
  HookType,
  MiddlewareItem,
  invokeMiddlewares,
  MiddlewareConstructor,
  LambdaMiddleware,
} from "../middlewares";
import { Stream } from "stream";
import * as mime from "mime-types";
import { isString, ObjectConstructor } from "../utils";
import { HttpException } from "../exceptions";

export abstract class Startup {
  readonly #mds: MiddlewareItem[] = [];
  use(
    lambda: (ctx: HttpContext, next: () => Promise<void>) => Promise<void>
  ): this;
  use(lambda: (ctx: HttpContext, next: () => Promise<void>) => void): this;
  use(
    lambda:
      | ((ctx: HttpContext, next: () => Promise<void>) => void)
      | ((ctx: HttpContext, next: () => Promise<void>) => Promise<void>)
  ): this {
    this.#mds.push(() => new LambdaMiddleware(lambda));
    return this;
  }

  add(builder: (ctx: HttpContext) => Middleware): this;
  add(builder: (ctx: HttpContext) => Promise<Middleware>): this;
  add(builder: (ctx: HttpContext) => MiddlewareConstructor): this;
  add(builder: (ctx: HttpContext) => Promise<MiddlewareConstructor>): this;
  add(md: Middleware): this;
  add(md: MiddlewareConstructor): this;
  add(
    md:
      | ((ctx: HttpContext) => Middleware)
      | ((ctx: HttpContext) => Promise<Middleware>)
      | ((ctx: HttpContext) => MiddlewareConstructor)
      | ((ctx: HttpContext) => Promise<MiddlewareConstructor>)
      | Middleware
      | MiddlewareConstructor
  ): this {
    this.#mds.push(md);
    return this;
  }

  hook<T extends Middleware = Middleware>(
    type: HookType.Constructor,
    mh: (
      ctx: HttpContext,
      middlewareConstructor: ObjectConstructor<T>
    ) => T | undefined
  ): this;
  hook<T extends Middleware = Middleware>(
    type: HookType.Constructor,
    mh: (
      ctx: HttpContext,
      middlewareConstructor: ObjectConstructor<T>
    ) => Promise<T | undefined>
  ): this;

  hook<T extends Error = HttpException>(
    type: HookType.Exception,
    mh: (ctx: HttpContext, middleware: Middleware, exception: T) => boolean
  ): this;
  hook<T extends Error = HttpException>(
    type: HookType.Exception,
    mh: (
      ctx: HttpContext,
      middleware: Middleware,
      exception: T
    ) => Promise<boolean>
  ): this;

  hook<T extends Middleware = Middleware>(
    type: HookType.BeforeInvoke | HookType.BeforeNext,
    mh: (ctx: HttpContext, middleware: T) => boolean | void
  ): this;
  hook<T extends Middleware = Middleware>(
    type: HookType.BeforeInvoke | HookType.BeforeNext,
    mh: (ctx: HttpContext, middleware: T) => Promise<boolean | void>
  ): this;

  hook<T extends Middleware = Middleware>(
    type: HookType.AfterInvoke,
    mh: (ctx: HttpContext, middleware: T) => void
  ): this;
  hook<T extends Middleware = Middleware>(
    type: HookType.AfterInvoke,
    mh: (ctx: HttpContext, middleware: T) => Promise<void>
  ): this;

  hook<T extends Middleware = Middleware>(
    mh: (ctx: HttpContext, middleware: T) => void
  ): this;
  hook<T extends Middleware = Middleware>(
    mh: (ctx: HttpContext, middleware: T) => Promise<void>
  ): this;

  hook(arg1: MdHook | HookType, arg2?: MdHook | HookType): this {
    let mh: MdHook;
    let type: HookType;

    if (typeof arg1 == "function") {
      mh = arg1;
      type = HookType.BeforeInvoke;
    } else {
      type = arg1;
      mh = arg2 as MdHook;
    }
    this.#mds.push(() => new HookMiddleware(mh, type));
    return this;
  }

  protected async invoke(ctx: HttpContext): Promise<SfaResponse> {
    (ctx as any).startup = this;
    if (!this.#mds.length) {
      return ctx.res;
    }

    try {
      await invokeMiddlewares(ctx, this.#mds);
    } catch (err) {
      ctx.catchError(err);
    }

    return this.#setType(ctx.res);
  }

  #setType(res: SfaResponse): SfaResponse {
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
