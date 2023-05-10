import "@halsp/testing";
import {
  getTransientInstances,
  InjectType,
  parseInject,
  tryParseInject,
} from "../src";
import "../src";
import { Startup } from "@halsp/core";

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
      const instance = await parseInject(ctx, TestService);
      expect(instance?.disposed).toBeTruthy();
    })
    .useInject()
    .inject(TestService)
    .use(async (ctx, next) => {
      const instance = await parseInject(ctx, TestService);
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
      const instance = getTransientInstances(ctx, TestService);
      expect(instance.some((item) => !item.disposed)).toBeFalsy();
    })
    .useInject()
    .inject(TestService, InjectType.Transient)
    .use(async (ctx, next) => {
      const dataSource1 = await parseInject(ctx, TestService);
      expect(dataSource1?.disposed).toBeFalsy();
      await dataSource1?.dispose();
      expect(dataSource1?.disposed).toBeTruthy();

      const dataSource2 = await parseInject(ctx, TestService);
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
      const instance = await parseInject(ctx, TestService);
      expect(instance?.disposed).toBeFalsy();
    })
    .useInject()
    .inject(TestService, InjectType.Singleton)
    .use(async (ctx, next) => {
      const instance = await parseInject(ctx, TestService);
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
      const instance = tryParseInject(ctx, TestService);
      expect(!!instance).toBeFalsy();
    })
    .useInject()
    .inject(TestService)
    .test();
  expect(ctx).not.toBeUndefined();
});
