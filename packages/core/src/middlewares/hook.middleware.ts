import { MdHook, Middleware, MIDDLEWARE_HOOK_BAG } from "./middleware";

export class HookMiddleware extends Middleware {
  constructor(private readonly mh: MdHook) {
    super();
  }

  async invoke(): Promise<void> {
    let hooks = this.ctx.bag<MdHook[]>(MIDDLEWARE_HOOK_BAG);
    if (!hooks) hooks = [];
    hooks.push(this.mh);
    this.ctx.bag(MIDDLEWARE_HOOK_BAG, hooks);
    await this.next();
  }
}
