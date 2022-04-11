import { Middleware, TestStartup, HookType } from "../../src";

class TestMiddleware extends Middleware {
  static index = 1;
  async invoke(): Promise<void> {
    this.setHeader(`h${TestMiddleware.index}`, this.count);
    TestMiddleware.index++;
    await this.next();
  }
  count = 0;
}

test("simple hook", async function () {
  const startup = new TestStartup()
    .hook((ctx, md) => {
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    .add(TestMiddleware) // 1 hook
    .hook((ctx, md) => {
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    .add(TestMiddleware) // 2 hooks
    .hook((ctx, md) => {
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    // executed but without effective
    .hook((ctx, md) => {
      if (md instanceof TestMiddleware) {
        md.count++;
        ctx.setHeader("after", "1");
      }
    }, HookType.AfterInvoke) // 3 hooks
    .add(TestMiddleware)
    .use((ctx) => ctx.ok());

  const result = await startup.run();
  expect(result.status).toBe(200);
  expect(result.getHeader("h1")).toBe("1");
  expect(result.getHeader("h2")).toBe("2");
  expect(result.getHeader("h3")).toBe("3");
  expect(result.getHeader("h4")).toBeUndefined();
  expect(result.getHeader("after")).toBe("1");
});
