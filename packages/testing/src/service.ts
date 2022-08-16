import "@ipare/core";
import { ObjectConstructor, Startup } from "@ipare/core";
import { parseInject } from "@ipare/inject";

declare module "@ipare/core" {
  interface Startup {
    expectService<T extends object>(
      key: string,
      fn: (service: T) => void | Promise<void>
    ): this;
    expectService<T extends object>(
      service: ObjectConstructor<T>,
      fn: (service: T) => void | Promise<void>
    ): this;
  }
}

Startup.prototype.expectService = function <T extends object>(
  service: ObjectConstructor<T> | string,
  fn: (service: T) => void | Promise<void>
) {
  return this.use(async (ctx, next) => {
    const sv = await parseInject<T>(ctx, service as any);
    if (!sv) throw new Error("Create service failed");

    await fn(sv);
    await next();
  });
};
