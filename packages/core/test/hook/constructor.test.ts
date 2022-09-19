import { Middleware, HookType } from "../../src";
import { TestStartup } from "../test-startup";

class TestMiddleware1 extends Middleware {
  constructor(private readonly num: number) {
    super();
  }

  async invoke(): Promise<void> {
    this.ctx.bag(`h1`, this.num);
    await this.next();
  }
}

class TestMiddleware2 extends Middleware {
  constructor(private readonly num: number) {
    super();
  }

  async invoke(): Promise<void> {
    this.ctx.bag(`h2`, this.num);
    await this.next();
  }
}

test("constructor hook", async () => {
  const ctx = await new TestStartup()
    .hook<TestMiddleware1>(HookType.Constructor, (ctx, md) => {
      if (md == TestMiddleware1) {
        return new md(1);
      }
    })
    .hook<TestMiddleware1>(HookType.Constructor, (ctx, md) => {
      // usless
      if (md == TestMiddleware1) {
        ctx.bag("h3", 3);
        return new md(3);
      }
    })
    .hook<TestMiddleware2>(HookType.Constructor, (ctx, md) => {
      if (md == TestMiddleware2) {
        return new md(2);
      }
    })
    .add(TestMiddleware1)
    .add(TestMiddleware2)
    .run();

  expect(ctx.bag("h1")).toBe(1);
  expect(ctx.bag("h2")).toBe(2);
  expect(ctx.bag("h3")).toBeUndefined();
});

test("constructor hook error", async () => {
  const ctx = await new TestStartup().add(TestMiddleware1).run();

  expect(ctx.bag("h1")).toBeUndefined();
});
