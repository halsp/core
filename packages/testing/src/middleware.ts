import "@ipare/core";
import {
  HookType,
  HttpContext,
  Middleware,
  ObjectConstructor,
  Startup,
} from "@ipare/core";

export type TestMiddlewareFn<T extends Middleware> = (
  md: T,
  ctx: HttpContext
) => void | Promise<void>;

export type ExpectMiddlewareType =
  | HookType.BeforeInvoke
  | HookType.AfterInvoke
  | HookType.BeforeNext;

declare module "@ipare/core" {
  interface Startup {
    expectMiddleware<T extends Middleware>(
      mdCls: ObjectConstructor<T>,
      fn: TestMiddlewareFn<T>,
      type?: ExpectMiddlewareType
    ): this;
  }
}

Startup.prototype.expectMiddleware = function <T extends Middleware>(
  mdCls: ObjectConstructor<T>,
  fn: TestMiddlewareFn<T>,
  type: ExpectMiddlewareType = HookType.BeforeInvoke
) {
  return this.hook(type as any, async (ctx, md: T) => {
    if (md.constructor == mdCls) {
      await fn(md, ctx);
    }
  });
};
