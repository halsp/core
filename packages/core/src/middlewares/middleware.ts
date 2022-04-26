import { HttpContext, ResultHandler } from "../context";
import { HttpException } from "../exceptions";
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
  | ((ctx: HttpContext) => Middleware)
  | ((ctx: HttpContext) => Promise<Middleware>)
  | ((ctx: HttpContext) => MiddlewareConstructor)
  | ((ctx: HttpContext) => Promise<MiddlewareConstructor>)
  | Middleware
  | MiddlewareConstructor;

export async function createMiddleware(
  ctx: HttpContext,
  middleware: MiddlewareItem
): Promise<Middleware> {
  if (middleware instanceof Middleware) {
    return middleware;
  } else if (isMiddlewareConstructor(middleware)) {
    return await execHooks(ctx, middleware, HookType.Constructor);
  } else {
    return createMiddleware(ctx, await middleware(ctx));
  }
}

export abstract class Middleware extends ResultHandler {
  constructor() {
    super(() => this.ctx.res);
  }

  #index!: number;
  #mds!: readonly MiddlewareItem[];

  #ctx!: HttpContext;
  public get ctx(): HttpContext {
    return this.#ctx;
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
      if (err instanceof HttpException && err.breakthrough) {
        throw err;
      } else {
        const hookResult = await execHooks(
          this.ctx,
          err as Error,
          HookType.Exception
        );
        if (!hookResult) {
          this.ctx.catchError(err);
        }
      }
    }
  }

  #createNextMiddleware = async (): Promise<Middleware> => {
    const middleware = this.#mds[this.#index + 1];
    return await createMiddleware(this.ctx, middleware);
  };

  private init(
    ctx: HttpContext,
    index: number,
    mds: readonly MiddlewareItem[]
  ): this {
    this.#mds = mds;
    this.#ctx = ctx;
    this.#index = index;
    return this;
  }
}
