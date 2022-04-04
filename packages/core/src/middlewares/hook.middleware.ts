import { HookItem, HookType, MdHook } from "./hook-item";
import { Middleware, MIDDLEWARE_HOOK_BAG } from "./middleware";

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
