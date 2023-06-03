import "@halsp/testing";
import { InjectType } from "../src";
import { Startup } from "@halsp/core";
import { InjectDecoratorParser } from "../src/inject-parser";

class TestService {
  #disposed = false;
  get disposed() {
    return this.#disposed;
  }

  async dispose() {
    this.#disposed = true;
  }
}

it("scoped instance should be dispose", async () => {
  const { ctx } = await new Startup()
    .use(async (ctx, next) => {
      await next();
      const instance = await ctx.getService(TestService);
      expect(instance?.disposed).toBeTruthy();
    })
    .useInject()
    .inject(TestService)
    .use(async (ctx, next) => {
      const instance = await ctx.getService(TestService);
      expect(instance?.disposed).toBeFalsy();
      await next();
    })
    .test();
  expect(ctx).not.toBeUndefined();
});

it("transient instance should be dispose", async () => {
  const { ctx } = await new Startup()
    .use(async (ctx, next) => {
      await next();
      const instance = new InjectDecoratorParser(ctx).getTransientInstances(
        TestService
      );
      expect(instance.some((item) => !item.disposed)).toBeFalsy();
    })
    .useInject()
    .inject(TestService, InjectType.Transient)
    .use(async (ctx, next) => {
      const dataSource1 = await ctx.getService(TestService);
      expect(dataSource1?.disposed).toBeFalsy();
      await dataSource1?.dispose();
      expect(dataSource1?.disposed).toBeTruthy();

      const dataSource2 = await ctx.getService(TestService);
      expect(dataSource2?.disposed).toBeFalsy();

      await next();
    })
    .test();
  expect(ctx).not.toBeUndefined();
});

it("singleton instance should not be dispose", async () => {
  const { ctx } = await new Startup()
    .use(async (ctx, next) => {
      await next();
      const instance = await ctx.getService(TestService);
      expect(instance?.disposed).toBeFalsy();
    })
    .useInject()
    .inject(TestService, InjectType.Singleton)
    .use(async (ctx, next) => {
      const instance = await ctx.getService(TestService);
      expect(instance?.disposed).toBeFalsy();
      await next();
    })
    .test();
  expect(ctx).not.toBeUndefined();
});

it("instance should be undefined", async () => {
  const { ctx } = await new Startup()
    .use(async (ctx, next) => {
      await next();
      const instance = ctx.getCachedService(TestService);
      expect(!!instance).toBeFalsy();
    })
    .useInject()
    .inject(TestService)
    .test();
  expect(ctx).not.toBeUndefined();
});
