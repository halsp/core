import { HttpContext } from "../context";
import { HookItem, HookType } from "./hook-item";
import { LambdaMiddleware } from "./lambda.middleware";
import { Middleware } from "./middleware";

export const MIDDLEWARE_HOOK_BAG = "__@sfajs/core_middlewareHooksBag__";

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
