import { Context } from "../context";
import { HookItem, HookType } from "./hook.item";
import { Startup } from "../startup";

const MIDDLEWARE_HOOK_BAG = "@halsp/core/middlewareHooksBag";
const hookMap = new WeakMap<Startup | Context, HookItem[]>();

export class HookManager {
  public static getGlobalHooks(startup: Startup, type?: HookType) {
    if (!hookMap.has(startup)) {
      hookMap.set(startup, []);
    }
    return hookMap.get(startup)!.filter((h) => !type || h.type == type);
  }

  public static addGlobalHook(startup: Startup, hook: HookItem) {
    if (!hookMap.has(startup)) {
      hookMap.set(startup, []);
    }
    const hooks = hookMap.get(startup)!;
    hooks.push(hook);
  }

  public static getHooks(ctx: Context, type?: HookType) {
    const globalHooks = this.getGlobalHooks(ctx.startup, type);

    const hooks = (ctx.get<HookItem[]>(MIDDLEWARE_HOOK_BAG) ?? []).filter(
      (h) => !type || h.type == type,
    );
    return [...globalHooks, ...hooks];
  }

  public static addHook(ctx: Context, hook: HookItem) {
    const hooks = ctx.get<HookItem[]>(MIDDLEWARE_HOOK_BAG) ?? [];
    hooks.push({ hook: hook.hook, type: hook.type });
    ctx.set(MIDDLEWARE_HOOK_BAG, hooks);
  }
}
