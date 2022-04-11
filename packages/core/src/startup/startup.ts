import { SfaResponse, HttpContext } from "../context";
import {
  Middleware,
  MdHook,
  HookMiddleware,
  HookType,
  MiddlewareItem,
  MiddlewareConstructor,
  LambdaMiddleware,
  createMiddleware,
  HookTypeWithoutConstructor,
} from "../middlewares";
import { Stream } from "stream";
import * as mime from "mime-types";
import { isPlainObject, ObjectConstructor } from "../utils";

export abstract class Startup {
  readonly #mds: MiddlewareItem[] = [];

  use(lambda: (ctx: HttpContext, next: () => Promise<void>) => void): this;
  use(
    lambda: (ctx: HttpContext, next: () => Promise<void>) => Promise<void>
  ): this;
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
    mh: (ctx: HttpContext, middleware: T) => void,
    type?: HookTypeWithoutConstructor
  ): this;
  hook<T extends Middleware = Middleware>(
    mh: (ctx: HttpContext, middleware: T) => Promise<void>,
    type?: HookTypeWithoutConstructor
  ): this;
  hook<T extends Middleware = Middleware>(
    mh: (
      ctx: HttpContext,
      middlewareConstructor: ObjectConstructor<T>
    ) => T | undefined,
    type?: HookType.Constructor
  ): this;
  hook<T extends Middleware = Middleware>(
    mh: (
      ctx: HttpContext,
      middlewareConstructor: ObjectConstructor<T>
    ) => Promise<T | undefined>,
    type?: HookType.Constructor
  ): this;
  hook(mh: MdHook, type = HookType.BeforeInvoke): this {
    this.#mds.push(() => new HookMiddleware(mh, type));
    return this;
  }

  protected async invoke(ctx: HttpContext): Promise<SfaResponse> {
    if (!this.#mds.length) {
      return ctx.res;
    }

    try {
      const md = await createMiddleware(ctx, this.#mds[0]);
      await (md as any).init(ctx, 0, this.#mds).invoke();
    } catch (err) {
      ctx.catchError(err);
    }

    return this.setType(ctx.res);
  }

  private setType(res: SfaResponse): SfaResponse {
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
      res.setHeader("Content-Type", mime.contentType("bin") as string);
    } else if (isPlainObject(body)) {
      if (writeLength) {
        res.setHeader(
          "content-length",
          Buffer.byteLength(JSON.stringify(body))
        );
      }
      if (writeType) {
        res.setHeader("content-type", mime.contentType("json") as string);
      }
    } else {
      const strBody = String(body);
      if (writeLength) {
        res.setHeader("content-length", Buffer.byteLength(strBody));
      }
      if (writeType) {
        const type = /^\s*</.test(strBody) ? "html" : "text";
        res.setHeader("content-type", mime.contentType(type) as string);
      }
    }

    return res;
  }
}
