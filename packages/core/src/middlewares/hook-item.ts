import { HttpContext } from "../context";
import { Middleware } from "./middleware";

export type MdHook =
  | ((ctx: HttpContext, md: Middleware) => void)
  | ((ctx: HttpContext, md: Middleware) => Promise<void>);

export enum HookType {
  Before,
  After,
  Constructor,
}

export interface HookItem {
  hook: MdHook;
  type: HookType;
}
