import { HttpContext, ResultHandler } from "../context";
import { HttpException } from "../exceptions";
import { HookItem, HookType } from "./hook-item";

export type FuncMiddleware = (ctx: HttpContext) => Middleware;

export const MIDDLEWARE_HOOK_BAG = "__@sfajs/core_middlewareHooksBag__";

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
      await this.#execHoods(nextMd, HookType.Before);
      await nextMd.invoke();
      await this.#execHoods(nextMd, HookType.After);
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

  #execHoods = async (middleware: Middleware, type: HookType) => {
    const hooks = this.ctx.bag<HookItem[]>(MIDDLEWARE_HOOK_BAG);
    for (const hookItem of (hooks ?? []).filter((h) => h.type == type)) {
      await hookItem.hook(this.ctx, middleware);
    }
  };
}
