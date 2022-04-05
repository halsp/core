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
} from "../middlewares";
import { Stream } from "stream";
import * as mime from "mime-types";
import { isPlainObject, ObjectConstructor } from "../utils";

export abstract class Startup {
  readonly #mds: MiddlewareItem[] = [];

  use(lambda: (ctx: HttpContext) => void): this;
  use(
    lambda: (ctx: HttpContext, next: () => Promise<void>) => Promise<void>
  ): this;
  use(
    lambda:
      | ((ctx: HttpContext) => void)
      | ((ctx: HttpContext, next: () => Promise<void>) => Promise<void>)
  ): this {
    this.#mds.push(() => new LambdaMiddleware(lambda));
    return this;
  }

  add(builder: (ctx: HttpContext) => Middleware): this;
  add(builder: (ctx: HttpContext) => Promise<Middleware>): this;
  add(md: Middleware): this;
  add(md: MiddlewareConstructor): this;
  add(
    md:
      | ((ctx: HttpContext) => Middleware)
      | ((ctx: HttpContext) => Promise<Middleware>)
      | Middleware
      | MiddlewareConstructor
  ): this {
    this.#mds.push(md);
    return this;
  }

  hook<T extends Middleware = Middleware>(
    mh: (ctx: HttpContext, md: T) => void,
    type?: HookType.After | HookType.Before
  ): this;
  hook<T extends Middleware = Middleware>(
    mh: (ctx: HttpContext, md: T) => Promise<void>,
    type?: HookType.After | HookType.Before
  ): this;
  hook<T extends Middleware = Middleware>(
    mh: (ctx: HttpContext, md: ObjectConstructor<T>) => T,
    type?: HookType.Constructor
  ): this;
  hook<T extends Middleware = Middleware>(
    mh: (ctx: HttpContext, md: ObjectConstructor<T>) => Promise<T>,
    type?: HookType.Constructor
  ): this;
  hook(mh: MdHook, type = HookType.Before): this {
    this.#mds.push(() => new HookMiddleware(mh, type));
    return this;
  }

  protected async invoke(ctx: HttpContext): Promise<SfaResponse> {
    if (!this.#mds.length) {
      return ctx.res;
    }

    const md = await createMiddleware(ctx, this.#mds[0]);
    try {
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
