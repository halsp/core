import { HttpContext, ResultHandler } from "../context";
import { HttpException } from "../exceptions";
import { execHoods, HookType } from "./hook.middleware";
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
    return await execHoods(ctx, middleware, HookType.Constructor);
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

  abstract invoke(): Promise<void>;
  protected async next(): Promise<void> {
    try {
      await execHoods(this.ctx, this, HookType.BeforeNext);
      if (this.#mds.length <= this.#index + 1) return;
      const nextMd = await this.#createNextMiddleware();
      nextMd.init(this.ctx, this.#index + 1, this.#mds);
      await execHoods(this.ctx, nextMd, HookType.BeforeInvoke);
      await nextMd.invoke();
      await execHoods(this.ctx, nextMd, HookType.AfterInvoke);
    } catch (err) {
      if (err instanceof HttpException && err.breakthrough) {
        throw err;
      } else {
        this.ctx.catchError(err);
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
