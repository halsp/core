import { Context, Request, Response } from "./context";
import {
  Middleware,
  MdHook,
  HookMiddleware,
  HookType,
  MiddlewareItem,
  invokeMiddlewares,
  MiddlewareConstructor,
  LambdaMiddleware,
} from "./middlewares";
import { ObjectConstructor } from "./utils";

export abstract class Startup {
  readonly #mds: MiddlewareItem[] = [];
  use(lambda: (ctx: Context, next: () => Promise<void>) => Promise<void>): this;
  use(lambda: (ctx: Context, next: () => Promise<void>) => void): this;
  use(
    lambda:
      | ((ctx: Context, next: () => Promise<void>) => void)
      | ((ctx: Context, next: () => Promise<void>) => Promise<void>)
  ): this {
    this.#mds.push(() => new LambdaMiddleware(lambda));
    return this;
  }

  add(
    builder: (ctx: Context) => Middleware,
    type?: MiddlewareConstructor
  ): this;
  add(
    builder: (ctx: Context) => Promise<Middleware>,
    type?: MiddlewareConstructor
  ): this;
  add(
    builder: (ctx: Context) => MiddlewareConstructor,
    type?: MiddlewareConstructor
  ): this;
  add(
    builder: (ctx: Context) => Promise<MiddlewareConstructor>,
    type?: MiddlewareConstructor
  ): this;
  add(md: Middleware): this;
  add(md: MiddlewareConstructor): this;
  add(
    md:
      | ((ctx: Context) => Middleware)
      | ((ctx: Context) => Promise<Middleware>)
      | ((ctx: Context) => MiddlewareConstructor)
      | ((ctx: Context) => Promise<MiddlewareConstructor>)
      | Middleware
      | MiddlewareConstructor,
    type?: MiddlewareConstructor
  ): this {
    if (type) {
      this.#mds.push([md as any, type]);
    } else {
      this.#mds.push(md);
    }
    return this;
  }

  hook<T extends Middleware = Middleware>(
    type: HookType.Constructor,
    mh: (
      ctx: Context,
      middlewareConstructor: ObjectConstructor<T>
    ) => T | undefined
  ): this;
  hook<T extends Middleware = Middleware>(
    type: HookType.Constructor,
    mh: (
      ctx: Context,
      middlewareConstructor: ObjectConstructor<T>
    ) => Promise<T | undefined>
  ): this;

  hook<T extends Error = Error>(
    type: HookType.Error,
    mh: (ctx: Context, middleware: Middleware, error: T) => boolean
  ): this;
  hook<T extends Error = Error>(
    type: HookType.Error,
    mh: (ctx: Context, middleware: Middleware, error: T) => Promise<boolean>
  ): this;

  hook<T extends Middleware = Middleware>(
    type: HookType.BeforeInvoke | HookType.BeforeNext,
    mh: (ctx: Context, middleware: T) => boolean | void
  ): this;
  hook<T extends Middleware = Middleware>(
    type: HookType.BeforeInvoke | HookType.BeforeNext,
    mh: (ctx: Context, middleware: T) => Promise<boolean | void>
  ): this;

  hook<T extends Middleware = Middleware>(
    type: HookType.AfterInvoke,
    mh: (ctx: Context, middleware: T) => void
  ): this;
  hook<T extends Middleware = Middleware>(
    type: HookType.AfterInvoke,
    mh: (ctx: Context, middleware: T) => Promise<void>
  ): this;

  hook<T extends Middleware = Middleware>(
    mh: (ctx: Context, middleware: T) => void
  ): this;
  hook<T extends Middleware = Middleware>(
    mh: (ctx: Context, middleware: T) => Promise<void>
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

  protected async invoke(ctx: Request | Context): Promise<Response> {
    ctx = ctx instanceof Context ? ctx : new Context(ctx);

    Object.defineProperty(ctx, "startup", {
      configurable: true,
      get: () => this,
    });
    if (!this.#mds.length) {
      return ctx.res;
    }

    try {
      await invokeMiddlewares(ctx, this.#mds);
    } catch (err) {
      ctx.catchError(err);
    }
    return ctx.res;
  }
}
