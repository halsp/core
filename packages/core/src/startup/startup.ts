import { SfaResponse, HttpContext } from "../context";
import {
  Middleware,
  LambdaMiddleware,
  LambdaMiddlewareBuilder,
  LambdaMiddlewareBuilderAsync,
  MiddlewareHook,
  MiddlewareHookAsync,
  MdHook,
  FuncMiddleware,
  HookMiddleware,
  HookType,
} from "../middlewares";
import { Stream } from "stream";
import * as mime from "mime-types";
import { isPlainObject } from "../utils";

type MiddlewareConstructor = {
  new (...args: any[]): Middleware;
};
function isMiddlewareConstructor(md: any): md is MiddlewareConstructor {
  return !!md.prototype;
}

export abstract class Startup {
  readonly #mds: FuncMiddleware[] = [];

  use(builder: LambdaMiddlewareBuilderAsync): this;
  use(builder: LambdaMiddlewareBuilder): this;
  use(builder: LambdaMiddlewareBuilderAsync | LambdaMiddlewareBuilder): this {
    this.#mds.push(() => new LambdaMiddleware(builder));
    return this;
  }

  add(md: FuncMiddleware): this;
  add(md: Middleware): this;
  add(md: MiddlewareConstructor): this;
  add(md: FuncMiddleware | Middleware | MiddlewareConstructor): this {
    if (md instanceof Middleware) {
      this.#mds.push(() => md);
    } else if (isMiddlewareConstructor(md)) {
      this.#mds.push(() => new md());
    } else {
      this.#mds.push(md);
    }
    return this;
  }

  hook(mh: MiddlewareHook, type?: HookType): this;
  hook(mh: MiddlewareHookAsync, type?: HookType): this;
  hook(mh: MdHook, type = HookType.Before): this {
    this.#mds.push(() => new HookMiddleware(mh, type));
    return this;
  }

  hookBefore(mh: MiddlewareHook): this;
  hookBefore(mh: MiddlewareHookAsync): this;
  hookBefore(mh: MdHook): this {
    return this.hook(mh, HookType.Before);
  }

  hookAfter(mh: MiddlewareHook): this;
  hookAfter(mh: MiddlewareHookAsync): this;
  hookAfter(mh: MdHook): this {
    return this.hook(mh, HookType.After);
  }

  protected async invoke(ctx: HttpContext): Promise<SfaResponse> {
    if (!this.#mds.length) {
      return ctx.res;
    }

    const md = this.#mds[0](ctx);
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
