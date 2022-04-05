import { HttpContext, ResultHandler } from "../context";
import { HttpException } from "../exceptions";
import { HookType } from "./hook-item";
import { execHoods } from "./hook.middleware";
import { createMiddleware } from "./middleware-creater";
import { MiddlewareItem } from "./utils";

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
    if (this.#mds.length <= this.#index + 1) return;
    const nextMd = await createMiddleware(
      this.#ctx,
      this.#mds[this.#index + 1]
    );
    nextMd.init(this.ctx, this.#index + 1, this.#mds);
    try {
      await execHoods(this.ctx, nextMd, HookType.Before);
      await nextMd.invoke();
      await execHoods(this.ctx, nextMd, HookType.After);
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
    mds: readonly MiddlewareItem[]
  ): this {
    this.#mds = mds;
    this.#ctx = ctx;
    this.#index = index;
    return this;
  }
}
