import { HttpContext } from "../context";
import { Middleware } from "./middleware";
import { MiddlewareConstructor } from "./utils";

export type MdHook<T extends Middleware | MiddlewareConstructor = any> = (
  ctx: HttpContext,
  md: T
) => void | Promise<void> | Middleware | Promise<Middleware>;

export enum HookType {
  Before,
  After,
  Constructor,
}

export interface HookItem {
  hook: MdHook;
  type: HookType;
}
