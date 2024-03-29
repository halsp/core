import { Middleware, HookType, Startup } from "../../src";
import "../test-startup";

class TestMiddleware1 extends Middleware {
  constructor(private readonly num: number) {
    super();
  }

  async invoke(): Promise<void> {
    this.ctx.set(`h1`, this.num);
    await this.next();
  }
}

class TestMiddleware2 extends Middleware {
  constructor(private readonly num: number) {
    super();
  }

  async invoke(): Promise<void> {
    this.ctx.set(`h2`, this.num);
    await this.next();
  }
}

test("constructor hook", async () => {
  const { ctx } = await new Startup()
    .hook<TestMiddleware1>(HookType.Constructor, (ctx, md) => {
      if (md == TestMiddleware1) {
        return new md(1);
      }
    })
    .hook<TestMiddleware1>(HookType.Constructor, (ctx, md) => {
      // usless
      if (md == TestMiddleware1) {
        ctx.set("h3", 3);
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

  expect(ctx.get("h1")).toBe(1);
  expect(ctx.get("h2")).toBe(2);
  expect(ctx.get("h3")).toBeUndefined();
});

test("constructor hook error", async () => {
  const { ctx } = await new Startup().add(TestMiddleware1).run();

  expect(ctx.get("h1")).toBeUndefined();
});
