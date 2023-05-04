import { Middleware, Startup } from "../../src";
import "../test-startup";

class TestMiddleware extends Middleware {
  async invoke(): Promise<void> {
    this.ctx.set("result", "test");
  }
}

test("add middleware constructor", async () => {
  const startup = new Startup().add(TestMiddleware);

  const { ctx } = await startup.run();
  expect(ctx.get("result")).toBe("test");
});

test("add function middleware constructor", async () => {
  const startup = new Startup().add(() => TestMiddleware);

  const { ctx } = await startup.run();
  expect(ctx.get("result")).toBe("test");
});

test("add async function middleware constructor", async () => {
  const startup = new Startup().add(async () => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 200);
    });
    return TestMiddleware;
  });

  const { ctx } = await startup.run();
  expect(ctx.get("result")).toBe("test");
});
