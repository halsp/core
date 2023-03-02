import {
  HookType,
  Context,
  Middleware,
  ObjectConstructor,
  Startup,
} from "@halsp/common";

export type TestMiddlewareFn<T extends Middleware> = (
  md: T,
  ctx: Context
) => void | Promise<void>;

export type ExpectMiddlewareType =
  | HookType.BeforeInvoke
  | HookType.AfterInvoke
  | HookType.BeforeNext;

declare module "@halsp/common" {
  interface Startup {
    expectMiddleware<T extends Middleware>(
      mdCls: ObjectConstructor<T>,
      fn: TestMiddlewareFn<T>,
      type?: ExpectMiddlewareType
    ): this;
  }
}

Startup.prototype.expectMiddleware = function <T extends Middleware>(
  middleware: ObjectConstructor<T>,
  expect: TestMiddlewareFn<T>,
  type: ExpectMiddlewareType = HookType.BeforeInvoke
) {
  const key = "";
  return this.use(async (ctx, next) => {
    await next();
    if (!ctx.get(key)) {
      throw new Error("The middleware is not executed!");
    }
  }).hook(type as any, async (ctx, md: T) => {
    if (md.constructor == middleware) {
      ctx.set(key, true);
      await expect(md, ctx);
    }
  });
};
