import { HttpContext } from "../context";
import { HookItem, HookType } from "./hook-item";
import { LambdaMiddleware } from "./lambda.middleware";
import { Middleware } from "./middleware";

export const MIDDLEWARE_HOOK_BAG = "__@sfajs/core_middlewareHooksBag__";

export type FuncMiddleware = (ctx: HttpContext) => Middleware;

export type MiddlewareConstructor = {
  new (...args: any[]): Middleware;
};

export function isMiddlewareConstructor(md: any): md is MiddlewareConstructor {
  return !!md.prototype;
}

export type MiddlewareItem =
  | LambdaMiddleware
  | ((ctx: HttpContext) => Middleware)
  | ((ctx: HttpContext) => Promise<Middleware>)
  | Middleware
  | MiddlewareConstructor;

export type MiddlewareHook = (ctx: HttpContext, md: Middleware) => void;
export type MiddlewareHookAsync = (
  ctx: HttpContext,
  md: Middleware
) => Promise<void>;
export type MdHook = MiddlewareHook | MiddlewareHookAsync;

export async function execHoods(
  ctx: HttpContext,
  middleware: Middleware,
  type: HookType
): Promise<Middleware | void> {
  const hooks = ctx.bag<HookItem[]>(MIDDLEWARE_HOOK_BAG);
  for (const hookItem of (hooks ?? []).filter((h) => h.type == type)) {
    await hookItem.hook(ctx, middleware);
  }
}
