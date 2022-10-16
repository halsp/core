import { Middleware, HookType } from "../../src";
import { TestStartup } from "../test-startup";

class TestMiddleware extends Middleware {
  static index = 1;
  async invoke(): Promise<void> {
    const index = TestMiddleware.index;
    TestMiddleware.index++;

    this.ctx.bag(`h1${index}`, this.count);
    await this.next();
    this.ctx.bag(`h2${index}`, this.count);
  }
  count = 0;
}

test("simple hook", async () => {
  const startup = new TestStartup()
    .hook((ctx, md) => {
      // 1 before hook
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    .add(TestMiddleware)
    .hook((ctx, md) => {
      // 2 before hook
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    .add(TestMiddleware)
    .hook((ctx, md) => {
      // 3 before hook
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    .hook(HookType.AfterInvoke, (ctx, md) => {
      // executed but without effective
      if (md instanceof TestMiddleware) {
        md.count++;
        ctx.bag("after", 1);
      }
    })
    .hook(HookType.BeforeNext, (ctx, md) => {
      // executed before next
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    .add(TestMiddleware);

  const { ctx } = await startup.run();
  expect(ctx.bag("h11")).toBe(1);
  expect(ctx.bag("h12")).toBe(2);
  expect(ctx.bag("h13")).toBe(3);
  expect(ctx.bag("h14")).toBeUndefined();
  expect(ctx.bag("after")).toBe(1);

  expect(ctx.bag("h21")).toBe(1);
  expect(ctx.bag("h22")).toBe(2);
  expect(ctx.bag("h23")).toBe(4);
});
