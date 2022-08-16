import "@ipare/core";
import { isString, ObjectConstructor, Startup } from "@ipare/core";
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
    if (isString(service)) {
      const sv = await parseInject<T>(ctx, service);
      if (!sv) throw new Error("Create service failed");
      await fn(sv);
    } else {
      const sv = await parseInject<T>(ctx, service);
      await fn(sv);
    }
    await next();
  });
};
