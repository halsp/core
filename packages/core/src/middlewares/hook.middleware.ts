import { HttpContext } from "../context";
import { Middleware, MiddlewareConstructor } from "./middleware";

const MIDDLEWARE_HOOK_BAG = "__@sfajs/core_middlewareHooksBag__";

export type MdHook<T extends Middleware | MiddlewareConstructor | Error = any> =
  (
    ctx: HttpContext,
    md: T,
    error?: Error
  ) =>
    | void
    | Promise<void | boolean>
    | Middleware
    | undefined
    | Promise<Middleware | undefined>
    | boolean
    | Promise<boolean>;

export enum HookType {
  BeforeInvoke,
  AfterInvoke,
  BeforeNext,
  Constructor,
  Exception,
}

const isHTCons = (type: HookType) =>
  type == HookType.Constructor ? undefined : type;
isHTCons(HookType.Constructor); // just for test
isHTCons(HookType.BeforeNext); // just for test
type isHTConsRT = ReturnType<typeof isHTCons>;
export type HookTypeWithoutConstructor = isHTConsRT & HookType;

const isHTBefore = (type: HookType) =>
  type == HookType.BeforeInvoke || type == HookType.BeforeNext
    ? type
    : undefined;
isHTBefore(HookType.Constructor); // just for test
isHTBefore(HookType.BeforeInvoke); // just for test
type isHTBeforeRT = ReturnType<typeof isHTBefore>;
export type HookTypeBefore = isHTBeforeRT & HookType;

export interface HookItem {
  hook: MdHook;
  type: HookType;
}

export class HookMiddleware extends Middleware {
  constructor(mh: MdHook, type: HookType) {
    super();
    this.#mh = mh;
    this.#type = type;
  }

  #mh: MdHook;
  #type: HookType;

  async invoke(): Promise<void> {
    const hooks = this.ctx.bag<HookItem[]>(MIDDLEWARE_HOOK_BAG) ?? [];
    hooks.push({ hook: this.#mh, type: this.#type });
    this.ctx.bag(MIDDLEWARE_HOOK_BAG, hooks);
    await this.next();
  }
}

export async function execHooks(
  ctx: HttpContext,
  middleware: Middleware,
  type: HookType.Exception,
  exception: Error
): Promise<boolean>;
export async function execHooks(
  ctx: HttpContext,
  middleware: MiddlewareConstructor,
  type: HookType.Constructor
): Promise<Middleware>;
export async function execHooks(
  ctx: HttpContext,
  middleware: Middleware,
  type: HookTypeBefore
): Promise<boolean | void>;
export async function execHooks(
  ctx: HttpContext,
  middleware: Middleware,
  type: HookTypeWithoutConstructor
): Promise<void>;
export async function execHooks(
  ctx: HttpContext,
  middleware: Middleware | MiddlewareConstructor,
  type: HookType,
  error?: Error
): Promise<Middleware | void | boolean> {
  if (type == HookType.Constructor) {
    return await execConstructorHooks(ctx, middleware as MiddlewareConstructor);
  } else if (type == HookType.Exception) {
    return await execExceptionHooks(
      ctx,
      middleware as Middleware,
      error as Error
    );
  }

  const hooks = ctx.bag<HookItem[]>(MIDDLEWARE_HOOK_BAG) ?? [];
  for (const hookItem of hooks.filter((h) => h.type == type)) {
    const hookResult = await hookItem.hook(ctx, middleware);
    if (typeof hookResult == "boolean" && !hookResult) {
      return false;
    }
  }
}

async function execExceptionHooks(
  ctx: HttpContext,
  middleware: Middleware,
  error: Error
): Promise<boolean> {
  const hooks = ctx.bag<HookItem[]>(MIDDLEWARE_HOOK_BAG) ?? [];
  let result = false;
  for (const hookItem of hooks.filter((h) => h.type == HookType.Exception)) {
    result = (await hookItem.hook(ctx, middleware, error)) as boolean;
    if (result) break;
  }
  return result;
}

async function execConstructorHooks(
  ctx: HttpContext,
  middleware: MiddlewareConstructor
): Promise<Middleware | undefined> {
  const hooks = ctx.bag<HookItem[]>(MIDDLEWARE_HOOK_BAG) ?? [];
  let result: Middleware | undefined;
  for (const hookItem of hooks.filter((h) => h.type == HookType.Constructor)) {
    if (!(middleware instanceof Middleware)) {
      result = (await hookItem.hook(ctx, middleware)) as Middleware;
      if (result) break;
    }
  }
  if (!result) result = new middleware();
  return result;
}
