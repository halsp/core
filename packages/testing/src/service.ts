import "@ipare/core";
import { HttpContext, ObjectConstructor, Startup } from "@ipare/core";
import { getDepFunc } from "./deps";

declare module "@ipare/core" {
  interface Startup {
    expectInject<T extends object>(
      key: string,
      fn: (service: T, ctx: HttpContext) => void | Promise<void>
    ): this;
    expectInject<T extends object>(
      service: ObjectConstructor<T>,
      fn: (service: T, ctx: HttpContext) => void | Promise<void>
    ): this;
  }
}

Startup.prototype.expectInject = function <T extends object>(
  service: ObjectConstructor<T> | string,
  fn: (service: T, ctx: HttpContext) => void | Promise<void>
) {
  return this.use(async (ctx, next) => {
    await next();

    const parseInject = getDepFunc<
      <T>(ctx: HttpContext, service: any) => Promise<T>
    >("@ipare/inject", "parseInject");

    const sv = await parseInject<T>(ctx, service as any);
    if (!sv) throw new Error("Create service failed");

    await fn(sv, ctx);
  });
};
