import { Context } from "../context";
import { HalspException } from "../exception";
import { isClass, isObject, ObjectConstructor } from "../utils";
import { execHooks, HookType } from "./hook.middleware";
import { LambdaMiddleware } from "./lambda.middleware";

function isMiddlewareConstructor(md: any): md is MiddlewareConstructor {
  return !!md.prototype;
}

export type MiddlewareConstructor = {
  new (...args: any[]): Middleware;
};

export type MiddlewareItem =
  | LambdaMiddleware
  | ((ctx: Context) => Middleware)
  | [(ctx: Context) => Middleware, MiddlewareConstructor]
  | ((ctx: Context) => Promise<Middleware>)
  | [(ctx: Context) => Promise<Middleware>, MiddlewareConstructor]
  | ((ctx: Context) => MiddlewareConstructor)
  | [(ctx: Context) => MiddlewareConstructor, MiddlewareConstructor]
  | ((ctx: Context) => Promise<MiddlewareConstructor>)
  | Middleware
  | MiddlewareConstructor;

export async function createMiddleware(
  ctx: Context,
  middleware: MiddlewareItem
): Promise<Middleware> {
  if (middleware instanceof Middleware) {
    return middleware;
  } else if (isMiddlewareConstructor(middleware)) {
    return await execHooks(ctx, middleware, HookType.Constructor);
  } else if (Array.isArray(middleware)) {
    return createMiddleware(ctx, await middleware[0](ctx));
  } else {
    return createMiddleware(ctx, await middleware(ctx));
  }
}

export abstract class Middleware {
  #index!: number;
  #mds!: readonly MiddlewareItem[];

  #ctx!: Context;
  public get ctx(): Context {
    return this.#ctx;
  }
  get req() {
    return this.#ctx.req;
  }
  get request() {
    return this.#ctx.req;
  }
  get res() {
    return this.#ctx.res;
  }
  get response() {
    return this.#ctx.response;
  }

  get logger() {
    return this.ctx.logger;
  }
  set logger(val) {
    this.ctx.logger = val;
  }

  public isPrevInstanceOf<T extends object = any>(
    target: ObjectConstructor<T>
  ): target is ObjectConstructor<T> {
    const prevMd = this.#mds[this.#index - 1];
    return this.#isInstanceOf(prevMd, target);
  }

  public isNextInstanceOf<T extends object = any>(
    target: ObjectConstructor<T>
  ): target is ObjectConstructor<T> {
    const nextMd = this.#mds[this.#index + 1];
    return this.#isInstanceOf(nextMd, target);
  }

  #isInstanceOf<T extends object = any>(
    md: MiddlewareItem | undefined,
    target: ObjectConstructor<T>
  ) {
    if (!md) return false;
    if (md == target) return true;
    if (Array.isArray(md)) {
      return md[1] == target || md[1].prototype instanceof target;
    } else if (isClass(md)) {
      return md.prototype instanceof target;
    } else {
      return md instanceof target;
    }
  }

  abstract invoke(): void | Promise<void>;
  protected async next(): Promise<void> {
    let nextMd: Middleware | undefined = undefined;
    try {
      if (false == (await execHooks(this.ctx, this, HookType.BeforeNext))) {
        return;
      }
      if (this.#mds.length <= this.#index + 1) return;
      nextMd = await this.#createNextMiddleware();
      nextMd.init(this.ctx, this.#index + 1, this.#mds);
      if (false == (await execHooks(this.ctx, nextMd, HookType.BeforeInvoke))) {
        return;
      }
      await nextMd.invoke();
      await execHooks(this.ctx, nextMd, HookType.AfterInvoke);
    } catch (err) {
      const error = err as HalspException;
      if (isObject(error) && "breakthrough" in error && error.breakthrough) {
        throw error;
      } else {
        const hookResult = await execHooks(
          this.ctx,
          nextMd ?? this,
          HookType.Error,
          error
        );
        if (!hookResult) {
          this.ctx.errorStack.push(error);
        }
      }
    }
  }

  #createNextMiddleware = async (): Promise<Middleware> => {
    const middleware = this.#mds[this.#index + 1];
    return await createMiddleware(this.ctx, middleware);
  };

  private init(
    ctx: Context,
    index: number,
    mds: readonly MiddlewareItem[]
  ): this {
    this.#mds = mds;
    this.#ctx = ctx;
    this.#index = index;
    return this;
  }
}

export async function invokeMiddlewares(
  ctx: Context,
  mds: MiddlewareItem[],
  isRoot = false
) {
  const md = await createMiddleware(ctx, mds[0]);
  try {
    await (md as any).init(ctx, 0, mds).invoke();
  } catch (err) {
    const error = err as HalspException;
    const hookResult = await execHooks(ctx, md, HookType.Error, error);

    if (isRoot && !hookResult) {
      ctx.errorStack.push(error);
    }
  }
}
