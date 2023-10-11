import "@halsp/core";
import { Context, ObjectConstructor, Startup } from "@halsp/core";

declare module "@halsp/core" {
  interface Startup {
    expectInject<T extends object>(
      key: string,
      fn: (service: T, ctx: Context) => void | Promise<void>,
    ): this;
    expectInject<T extends object>(
      service: ObjectConstructor<T>,
      fn: (service: T, ctx: Context) => void | Promise<void>,
    ): this;
  }
}

Startup.prototype.expectInject = function <T extends object>(
  service: ObjectConstructor<T> | string,
  fn: (service: T, ctx: Context) => void | Promise<void>,
) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("@halsp/inject") as typeof import("@halsp/inject");

  return this.useInject().use(async (ctx, next) => {
    await next();

    const sv = await ctx["getService"]<T>(service as any);
    if (!sv) throw new Error("Create service failed");

    await fn(sv, ctx);
  });
};
