import { isPromise } from "util/types";
import { Context, Request, Response } from "./context";
import { BaseLogger, ILogger } from "./logger";
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
import { Register } from "./register";
import { ObjectConstructor } from "./utils";

export class Startup {
  constructor() {
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "production";
    }
  }

  readonly #mds: MiddlewareItem[] = [];
  use(lambda: (ctx: Context, next: () => Promise<void>) => Promise<void>): this;
  use(lambda: (ctx: Context, next: () => Promise<void>) => void): this;
  use(
    lambda:
      | ((ctx: Context, next: () => Promise<void>) => void)
      | ((ctx: Context, next: () => Promise<void>) => Promise<void>),
  ): this {
    this.#mds.push(() => new LambdaMiddleware(lambda));
    return this;
  }

  add(
    builder: (ctx: Context) => Middleware,
    type?: MiddlewareConstructor,
  ): this;
  add(
    builder: (ctx: Context) => Promise<Middleware>,
    type?: MiddlewareConstructor,
  ): this;
  add(
    builder: (ctx: Context) => MiddlewareConstructor,
    type?: MiddlewareConstructor,
  ): this;
  add(
    builder: (ctx: Context) => Promise<MiddlewareConstructor>,
    type?: MiddlewareConstructor,
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
    type?: MiddlewareConstructor,
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
      middlewareConstructor: ObjectConstructor<T>,
    ) => T | undefined,
  ): this;
  hook<T extends Middleware = Middleware>(
    type: HookType.Constructor,
    mh: (
      ctx: Context,
      middlewareConstructor: ObjectConstructor<T>,
    ) => Promise<T | undefined>,
  ): this;

  hook<T extends Error = Error>(
    type: HookType.Error,
    mh: (ctx: Context, middleware: Middleware, error: T) => boolean,
  ): this;
  hook<T extends Error = Error>(
    type: HookType.Error,
    mh: (ctx: Context, middleware: Middleware, error: T) => Promise<boolean>,
  ): this;

  hook<T extends Error = Error>(
    type: HookType.Unhandled,
    mh: (ctx: Context, middleware: Middleware, error: T) => void,
  ): this;
  hook<T extends Error = Error>(
    type: HookType.Unhandled,
    mh: (ctx: Context, middleware: Middleware, error: T) => Promise<void>,
  ): this;

  hook<T extends Middleware = Middleware>(
    type: HookType.BeforeInvoke | HookType.BeforeNext,
    mh: (ctx: Context, middleware: T) => boolean | void,
  ): this;
  hook<T extends Middleware = Middleware>(
    type: HookType.BeforeInvoke | HookType.BeforeNext,
    mh: (ctx: Context, middleware: T) => Promise<boolean | void>,
  ): this;

  hook<T extends Middleware = Middleware>(
    type: HookType.AfterInvoke,
    mh: (ctx: Context, middleware: T) => void,
  ): this;
  hook<T extends Middleware = Middleware>(
    type: HookType.AfterInvoke,
    mh: (ctx: Context, middleware: T) => Promise<void>,
  ): this;

  hook<T extends Middleware = Middleware>(
    mh: (ctx: Context, middleware: T) => void,
  ): this;
  hook<T extends Middleware = Middleware>(
    mh: (ctx: Context, middleware: T) => Promise<void>,
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

  protected async invoke(ctx?: Context | Request): Promise<Response> {
    ctx = ctx instanceof Context ? ctx : new Context(ctx);

    Object.defineProperty(ctx, "startup", {
      configurable: true,
      get: () => this,
    });
    if (!this.#mds.length) {
      return ctx.res;
    }

    await invokeMiddlewares(ctx, this.#mds, true);
    return ctx.res;
  }

  logger: ILogger = new BaseLogger();

  public extend<T extends keyof this>(name: T, fn: (typeof this)[T]): this {
    const beforeFn = this[name] as any;
    this[name as string] = (...args: any[]) => {
      let beforeResult: any;
      if (beforeFn) {
        beforeResult = beforeFn.call(this, ...args);
      }
      let currentResult = (fn as any).call(this, ...args);

      if (!isPromise(beforeResult) && !isPromise(currentResult)) {
        return currentResult ?? beforeResult;
      }

      return new Promise(async (resolve, reject) => {
        if (isPromise(beforeResult)) {
          beforeResult = await beforeResult.catch((err) => {
            reject(err);
          });
        }
        if (isPromise(currentResult)) {
          currentResult = await currentResult.catch((err) => {
            reject(err);
          });
        }

        resolve(currentResult ?? beforeResult);
      });
    };
    return this;
  }

  public call(when: (startup: this) => boolean, fn: (startup: this) => void) {
    if (!when(this)) {
      return this;
    }

    fn(this);
    return this;
  }

  #registers: Register[] = [];

  get registers() {
    return this.#registers;
  }

  public register(
    pattern: string,
    handler?: (ctx: Context) => Promise<void> | void,
  ) {
    this.#registers.push({
      pattern,
      handler,
    });
    return this;
  }
}
