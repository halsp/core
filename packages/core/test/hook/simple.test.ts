import { Middleware, HookType, Startup } from "../../src";
import "../test-startup";

class TestMiddleware extends Middleware {
  static index = 1;
  async invoke(): Promise<void> {
    const index = TestMiddleware.index;
    TestMiddleware.index++;

    this.ctx.set(`h1${index}`, this.count);
    await this.next();
    this.ctx.set(`h2${index}`, this.count);
  }
  count = 0;
}

test("simple hook", async () => {
  const startup = new Startup()
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
        ctx.set("after", 1);
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
  expect(ctx.get("h11")).toBe(1);
  expect(ctx.get("h12")).toBe(2);
  expect(ctx.get("h13")).toBe(3);
  expect(ctx.get("h14")).toBeUndefined();
  expect(ctx.get("after")).toBe(1);

  expect(ctx.get("h21")).toBe(1);
  expect(ctx.get("h22")).toBe(2);
  expect(ctx.get("h23")).toBe(4);
});
