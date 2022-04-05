import { HttpContext } from "../context";
import { HookItem, HookType, MdHook } from "./hook-item";
import { Middleware } from "./middleware";
import { MiddlewareConstructor, MIDDLEWARE_HOOK_BAG } from "./utils";

export class HookMiddleware extends Middleware {
  constructor(private readonly mh: MdHook, private readonly type: HookType) {
    super();
  }

  async invoke(): Promise<void> {
    const hooks = this.ctx.bag<HookItem[]>(MIDDLEWARE_HOOK_BAG) ?? [];
    hooks.push({ hook: this.mh, type: this.type });
    this.ctx.bag(MIDDLEWARE_HOOK_BAG, hooks);
    await this.next();
  }
}

export async function execHoods(
  ctx: HttpContext,
  middleware: Middleware,
  type: HookType.After | HookType.Before
): Promise<void>;
export async function execHoods(
  ctx: HttpContext,
  middleware: MiddlewareConstructor,
  type: HookType.Constructor
): Promise<Middleware>;
export async function execHoods(
  ctx: HttpContext,
  middleware: Middleware | MiddlewareConstructor,
  type: HookType
): Promise<Middleware | void> {
  const hooks = ctx.bag<HookItem[]>(MIDDLEWARE_HOOK_BAG) ?? [];
  let md: Middleware | undefined;
  for (const hookItem of hooks.filter((h) => h.type == type)) {
    if (middleware instanceof Middleware) {
      await hookItem.hook(ctx, middleware);
    } else {
      md = (await hookItem.hook(ctx, middleware)) as Middleware;
    }
  }
  if (middleware instanceof Middleware) {
    return;
  } else {
    if (!md) md = new middleware();
    return md;
  }
}
