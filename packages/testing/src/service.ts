import "@halsp/core";
import { Context, ObjectConstructor, Startup } from "@halsp/core";

declare module "@halsp/core" {
  interface Startup {
    expectInject<T extends object>(
      key: string,
      fn: (service: T, ctx: Context) => void | Promise<void>
    ): this;
    expectInject<T extends object>(
      service: ObjectConstructor<T>,
      fn: (service: T, ctx: Context) => void | Promise<void>
    ): this;
  }
}

Startup.prototype.expectInject = function <T extends object>(
  service: ObjectConstructor<T> | string,
  fn: (service: T, ctx: Context) => void | Promise<void>
) {
  return this.use(async (ctx, next) => {
    await next();

    const parseInject = getDepFunc<
      <T>(ctx: Context, service: any) => Promise<T>
    >("@halsp/inject", "parseInject");

    const sv = await parseInject<T>(ctx, service as any);
    if (!sv) throw new Error("Create service failed");

    await fn(sv, ctx);
  });
};

function getDepFunc<T = any>(depName: string, funcName: string): T {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const d = require(depName);
  return d[funcName] as T;
}
