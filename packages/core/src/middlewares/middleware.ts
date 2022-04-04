import { HttpContext, ResultHandler } from "../context";
import { HttpException } from "../exceptions";

export type MiddlewareHook = (ctx: HttpContext, md: Middleware) => void;
export type MiddlewareHookAsync = (
  ctx: HttpContext,
  md: Middleware
) => Promise<void>;
export type MdHook = MiddlewareHook | MiddlewareHookAsync;

export type FuncMiddleware = (ctx: HttpContext) => Middleware;

export const MIDDLEWARE_HOOK_BAG = "__middlewareHooks__";

export abstract class Middleware extends ResultHandler {
  constructor() {
    super(() => this.ctx.res);
  }

  #index!: number;
  #mds!: readonly FuncMiddleware[];

  #ctx!: HttpContext;
  public get ctx(): HttpContext {
    return this.#ctx;
  }

  abstract invoke(): Promise<void>;
  protected async next(): Promise<void> {
    if (this.#mds.length <= this.#index + 1) return;
    const nextMd = this.#mds[this.#index + 1](this.ctx);
    nextMd.init(this.ctx, this.#index + 1, this.#mds);
    try {
      await this.#execNextHoods(nextMd);
      await nextMd.invoke();
    } catch (err) {
      if (err instanceof HttpException && err.breakthrough) {
        throw err;
      } else {
        this.ctx.catchError(err);
      }
    }
  }

  private init(
    ctx: HttpContext,
    index: number,
    mds: readonly FuncMiddleware[]
  ): this {
    this.#mds = mds;
    this.#ctx = ctx;
    this.#index = index;
    return this;
  }

  #execNextHoods = async (nextMd: Middleware) => {
    const hooks = this.ctx.bag<MdHook[]>(MIDDLEWARE_HOOK_BAG);
    for (const hook of hooks ?? []) {
      await hook(this.ctx, nextMd);
    }
  };
}
