import { Middleware, TestStartup } from "../../src";
import { HookType } from "../../src/middlewares";

class TestMiddleware extends Middleware {
  constructor(private readonly num: number) {
    super();
  }

  async invoke(): Promise<void> {
    this.setHeader(`h`, this.num);
    await this.next();
  }
}

test("constructor hook", async function () {
  const res = await new TestStartup()
    .hook<TestMiddleware>((ctx, md) => {
      const result = new md(4);
      return result;
    }, HookType.Constructor)
    .add(TestMiddleware)
    .use((ctx) => ctx.ok())
    .run();

  expect(res.getHeader("h")).toBe("4");
  expect(res.status).toBe(200);
});

test("constructor hook error", async function () {
  const res = await new TestStartup()
    .add(TestMiddleware)
    .use((ctx) => ctx.ok())
    .run();

  expect(res.getHeader("h")).toBeUndefined();
  expect(res.status).toBe(200);
});
