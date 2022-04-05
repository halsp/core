import { HookItem, HookType } from "./hook-item";
import { Middleware } from "./middleware";
import { MdHook, MIDDLEWARE_HOOK_BAG } from "./utils";

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
