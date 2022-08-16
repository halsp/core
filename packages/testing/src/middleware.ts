import "@ipare/core";
import { HookType, HttpContext, Middleware, Startup } from "@ipare/core";

export type TestMiddlewareFn<T extends Middleware> = (
  ctx: HttpContext,
  md: T
) => void | Promise<void>;

export type ExpectMiddlewareType =
  | HookType.BeforeInvoke
  | HookType.AfterInvoke
  | HookType.BeforeNext;

declare module "@ipare/core" {
  interface Startup {
    expectMiddleware<T extends Middleware>(
      fn: TestMiddlewareFn<T>,
      type: ExpectMiddlewareType
    ): this;
  }
}

Startup.prototype.expectMiddleware = function <T extends Middleware>(
  fn: TestMiddlewareFn<T>,
  type: ExpectMiddlewareType
) {
  return this.hook(type as any, async (ctx, md: T) => {
    await fn(ctx, md);
  });
};
