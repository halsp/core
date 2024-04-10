import { Context } from "../context";
import { Middleware, MiddlewareConstructor } from "../middlewares";

export type MiddlewareResultHook<
  T extends Middleware | MiddlewareConstructor = any,
> = (ctx: Context, md: T) => Middleware | void | Promise<Middleware | void>;
export type BooleanResultHook<
  T extends Middleware | MiddlewareConstructor = any,
> = (ctx: Context, md: T) => Promise<void | boolean> | void | boolean;
export type ErrorMdHook<T extends Middleware | MiddlewareConstructor = any> = (
  ctx: Context,
  md: T,
  error: Error,
) => Promise<boolean> | boolean;
export type UnhandledMdHook<
  T extends Middleware | MiddlewareConstructor = any,
> = (ctx: Context, md: T, error: Error) => void | Promise<void>;
export type ContextHook = (
  args: any[],
) => void | Context | Promise<Context | void>;
export type BeginingHook = (
  ctx: Context,
) => boolean | Promise<boolean | void> | void;

export type MdHook<T extends Middleware | MiddlewareConstructor = any> =
  | MiddlewareResultHook<T>
  | BooleanResultHook<T>
  | ErrorMdHook<T>
  | UnhandledMdHook<T>
  | BeginingHook
  | ContextHook;

export enum HookType {
  Begining,
  Context,
  BeforeInvoke,
  AfterInvoke,
  BeforeNext,
  Constructor,
  Error,
  Unhandled,
}

export interface HookItem {
  hook: MdHook;
  type: HookType;
}
