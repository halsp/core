import { Middleware, HookType } from "../../src";
import { TestStartup } from "../test-startup";

class TestMiddleware extends Middleware {
  static index = 1;
  async invoke(): Promise<void> {
    const index = TestMiddleware.index;
    TestMiddleware.index++;

    this.setHeader(`h1${index}`, this.count);
    await this.next();
    this.setHeader(`h2${index}`, this.count);
  }
  count = 0;
}

test("simple hook", async function () {
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
        ctx.setHeader("after", "1");
      }
    })
    .hook(HookType.BeforeNext, (ctx, md) => {
      // executed before next
      if (md instanceof TestMiddleware) {
        md.count++;
      }
    })
    .add(TestMiddleware)
    .use((ctx) => ctx.ok());

  const result = await startup.run();
  expect(result.status).toBe(200);
  expect(result.getHeader("h11")).toBe("1");
  expect(result.getHeader("h12")).toBe("2");
  expect(result.getHeader("h13")).toBe("3");
  expect(result.getHeader("h14")).toBeUndefined();
  expect(result.getHeader("after")).toBe("1");

  expect(result.getHeader("h21")).toBe("1");
  expect(result.getHeader("h22")).toBe("2");
  expect(result.getHeader("h23")).toBe("4");
});
