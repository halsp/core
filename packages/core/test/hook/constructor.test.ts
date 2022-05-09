import { Middleware, HookType } from "../../src";
import { TestStartup } from "../test-startup";

class TestMiddleware1 extends Middleware {
  constructor(private readonly num: number) {
    super();
  }

  async invoke(): Promise<void> {
    this.setHeader(`h1`, this.num);
    await this.next();
  }
}

class TestMiddleware2 extends Middleware {
  constructor(private readonly num: number) {
    super();
  }

  async invoke(): Promise<void> {
    this.setHeader(`h2`, this.num);
    await this.next();
  }
}

test("constructor hook", async function () {
  const res = await new TestStartup()
    .hook<TestMiddleware1>(HookType.Constructor, (ctx, md) => {
      if (md == TestMiddleware1) {
        return new md(1);
      }
    })
    .hook<TestMiddleware1>(HookType.Constructor, (ctx, md) => {
      // usless
      if (md == TestMiddleware1) {
        ctx.setHeader("h3", 3);
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
    .use((ctx) => ctx.ok())
    .run();

  expect(res.getHeader("h1")).toBe("1");
  expect(res.getHeader("h2")).toBe("2");
  expect(res.getHeader("h3")).toBeUndefined();
  expect(res.status).toBe(200);
});

test("constructor hook error", async function () {
  const res = await new TestStartup()
    .add(TestMiddleware1)
    .use((ctx) => ctx.ok())
    .run();

  expect(res.getHeader("h1")).toBeUndefined();
  expect(res.status).toBe(200);
});
