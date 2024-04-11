import { isPromise } from "util/types";
import { Context, Response } from "./context";
import { BaseLogger, ILogger } from "./logger";
import {
  Middleware,
  MiddlewareItem,
  invokeMiddlewares,
  MiddlewareConstructor,
  LambdaMiddleware,
} from "./middlewares";
import { Register } from "./register";
import { ObjectConstructor } from "./utils";
import { HookManager } from "./hook/hook.manager";
import { HookType, MdHook } from "./hook";
import {
  execBeginingHooks,
  execContextHooks,
  execInitializationHooks,
} from "./hook/hook.exec";

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
    mh: (ctx: Context, middlewareConstructor: ObjectConstructor<T>) => T | void,
    isGlobal?: true,
  ): this;
  hook<T extends Middleware = Middleware>(
    type: HookType.Constructor,
    mh: (
      ctx: Context,
      middlewareConstructor: ObjectConstructor<T>,
    ) => Promise<T | void>,
    isGlobal?: true,
  ): this;

  hook<T extends Error = Error>(
    type: HookType.Error,
    mh: (ctx: Context, middleware: Middleware, error: T) => boolean,
    isGlobal?: true,
  ): this;
  hook<T extends Error = Error>(
    type: HookType.Error,
    mh: (ctx: Context, middleware: Middleware, error: T) => Promise<boolean>,
    isGlobal?: true,
  ): this;

  hook<T extends Error = Error>(
    type: HookType.Unhandled,
    mh: (ctx: Context, middleware: Middleware, error: T) => void,
    isGlobal?: true,
  ): this;
  hook<T extends Error = Error>(
    type: HookType.Unhandled,
    mh: (ctx: Context, middleware: Middleware, error: T) => Promise<void>,
    isGlobal?: true,
  ): this;

  hook<T extends Middleware = Middleware>(
    type: HookType.BeforeInvoke | HookType.BeforeNext,
    mh: (ctx: Context, middleware: T) => boolean | void,
    isGlobal?: true,
  ): this;
  hook<T extends Middleware = Middleware>(
    type: HookType.BeforeInvoke | HookType.BeforeNext,
    mh: (ctx: Context, middleware: T) => Promise<boolean | void>,
    isGlobal?: true,
  ): this;

  hook<T extends Middleware = Middleware>(
    type: HookType.AfterInvoke,
    mh: (ctx: Context, middleware: T) => void,
    isGlobal?: true,
  ): this;
  hook<T extends Middleware = Middleware>(
    type: HookType.AfterInvoke,
    mh: (ctx: Context, middleware: T) => Promise<void>,
    isGlobal?: true,
  ): this;

  hook(type: HookType.Begining, mh: (ctx: Context) => boolean | void): this;
  hook(
    type: HookType.Begining,
    mh: (ctx: Context) => Promise<boolean | void>,
  ): this;

  hook(type: HookType.Context, mh: (args: any[]) => Context | void): this;
  hook(
    type: HookType.Context,
    mh: (...args: any[]) => Promise<Context | void>,
  ): this;

  hook(type: HookType.Initialization, mh: (args: any[]) => void): this;
  hook(type: HookType.Initialization, mh: (args: any[]) => Promise<void>): this;

  hook<T extends Middleware = Middleware>(
    mh: (ctx: Context, middleware: T) => void,
    isGlobal?: true,
  ): this;
  hook<T extends Middleware = Middleware>(
    mh: (ctx: Context, middleware: T) => Promise<void>,
    isGlobal?: true,
  ): this;

  hook(
    arg1: MdHook | HookType,
    arg2?: MdHook | HookType | true,
    arg3?: true,
  ): this {
    let mh: MdHook;
    let type: HookType;
    let isGlobal: true | undefined;

    if (typeof arg1 == "function") {
      mh = arg1;
      type = HookType.BeforeInvoke;
      isGlobal = arg2 as true | undefined;
    } else {
      type = arg1;
      mh = arg2 as MdHook;
      isGlobal = arg3 as true | undefined;
    }

    if (
      type == HookType.Context ||
      type == HookType.Begining ||
      type == HookType.Initialization
    ) {
      isGlobal = true;
    }

    if (isGlobal) {
      HookManager.addGlobalHook(this, { hook: mh, type: type });
    } else {
      this.use(async (ctx, next) => {
        HookManager.addHook(ctx, { hook: mh, type: type });
        await next();
      });
    }

    return this;
  }

  protected async invoke(...args: any[]): Promise<Response> {
    const ctx = await execContextHooks(this, args);

    Object.defineProperty(ctx, "startup", {
      configurable: true,
      get: () => this,
    });
    if (!this.#mds.length) {
      return ctx.res;
    }

    if (false == (await execBeginingHooks(ctx))) {
      return ctx.res;
    }

    await invokeMiddlewares(ctx, this.#mds, true);
    return ctx.res;
  }

  protected async initialize(...args: any[]) {
    await execInitializationHooks(this, args);
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
