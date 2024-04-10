import { Startup } from "..";
import { Context, Request } from "../context";
import { Middleware, MiddlewareConstructor } from "../middlewares";
import {
  MiddlewareResultHook,
  HookType,
  ErrorMdHook,
  BeginingHook,
  BooleanResultHook,
  UnhandledMdHook,
} from "./hook.item";
import { HookManager } from "./hook.manager";

export async function execContextHooks(
  startup: Startup,
  args: any[],
): Promise<Context> {
  const hooks = HookManager.getGlobalHooks(startup, HookType.Context);
  let result: Context | undefined;
  for (const hookItem of hooks) {
    const hook = hookItem.hook as (
      args: any[],
    ) => void | Context | Promise<Context | undefined>;
    result = (await hook(args)) as Context;
    if (result) break;
  }
  if (!result) {
    if (args[0] instanceof Context) {
      result = args[0] as Context;
    } else if (args[0] instanceof Request) {
      result = new Context(args[0] as Request);
    } else {
      result = new Context();
    }
  }
  return result;
}

export async function execConstructorHooks(
  ctx: Context,
  middleware: MiddlewareConstructor,
): Promise<Middleware> {
  const hooks = HookManager.getHooks(ctx, HookType.Constructor);
  let result: Middleware | undefined | void;
  for (const hookItem of hooks) {
    if (!(middleware instanceof Middleware)) {
      const hook = hookItem.hook as MiddlewareResultHook;
      result = await hook(ctx, middleware);
      if (result) break;
    }
  }
  if (!result) result = new middleware();
  return result;
}

export async function execErrorHooks(
  ctx: Context,
  middleware: Middleware,
  error: Error,
): Promise<boolean> {
  const hooks = HookManager.getHooks(ctx, HookType.Error);
  let result = false;
  for (const hookItem of hooks) {
    const hook = hookItem.hook as ErrorMdHook;
    result = await hook(ctx, middleware, error);
    if (result) break;
  }
  return result;
}

export async function execUnhandledHooks(
  ctx: Context,
  middleware: Middleware,
  error: Error,
): Promise<void> {
  const hooks = HookManager.getHooks(ctx, HookType.Unhandled);
  for (const hookItem of hooks) {
    const hook = hookItem.hook as UnhandledMdHook;
    await hook(ctx, middleware, error);
  }
}

export async function execBeginingHooks(ctx: Context) {
  const hooks = HookManager.getGlobalHooks(ctx.startup, HookType.Begining);
  for (const hookItem of hooks) {
    const hook = hookItem.hook as BeginingHook;
    const hookResult = await hook(ctx);
    if (typeof hookResult == "boolean" && !hookResult) {
      return false;
    }
  }
}

export async function execHooks(
  ctx: Context,
  type: HookType,
  middleware: Middleware | MiddlewareConstructor,
) {
  const hooks = HookManager.getHooks(ctx, type);
  for (const hookItem of hooks) {
    const hook = hookItem.hook as MiddlewareResultHook | BooleanResultHook;
    const hookResult = await hook(ctx, middleware);
    if (typeof hookResult == "boolean" && !hookResult) {
      return false;
    }
  }
}
