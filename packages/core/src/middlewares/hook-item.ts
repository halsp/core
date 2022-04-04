import { HttpContext } from "../context";
import { Middleware } from "./middleware";

export type MiddlewareHook = (ctx: HttpContext, md: Middleware) => void;
export type MiddlewareHookAsync = (
  ctx: HttpContext,
  md: Middleware
) => Promise<void>;
export type MdHook = MiddlewareHook | MiddlewareHookAsync;

export enum HookType {
  Before,
  After,
}

export interface HookItem {
  hook: MdHook;
  type: HookType;
}
