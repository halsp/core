import { HttpContext } from "../context";
import { Middleware, MiddlewareConstructor } from "./middleware";

const MIDDLEWARE_HOOK_BAG = "__@sfajs/core_middlewareHooksBag__";

export type MdHook<T extends Middleware | MiddlewareConstructor = any> = (
  ctx: HttpContext,
  md: T
) =>
  | void
  | Promise<void>
  | Middleware
  | undefined
  | Promise<Middleware | undefined>;

export enum HookType {
  BeforeInvoke,
  AfterInvoke,
  BeforeNext,
  Constructor,
}

const isHTCons = (type: HookType) =>
  type == HookType.Constructor ? undefined : type;
isHTCons(HookType.Constructor); // just for test
isHTCons(HookType.BeforeNext); // just for test
type isHTConsRT = ReturnType<typeof isHTCons>;
export type HookTypeWithoutConstructor = isHTConsRT & HookType;

export interface HookItem {
  hook: MdHook;
  type: HookType;
}

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
  type: HookTypeWithoutConstructor
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
    if (type != HookType.Constructor) {
      await hookItem.hook(ctx, middleware);
    } else if (!(middleware instanceof Middleware)) {
      md = (await hookItem.hook(ctx, middleware)) as Middleware;
      if (md) break;
    }
  }
  if (middleware instanceof Middleware || type != HookType.Constructor) {
    return;
  } else {
    if (!md) md = new middleware();
    return md;
  }
}
