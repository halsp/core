import { Middleware } from "../../src";
import { TestStartup } from "../test-startup";

class TestMiddleware extends Middleware {
  async invoke(): Promise<void> {
    this.ctx.bag("result", "test");
  }
}

test("add middleware constructor", async () => {
  const startup = new TestStartup().add(TestMiddleware);

  const { ctx } = await startup.run();
  expect(ctx.bag("result")).toBe("test");
});

test("add function middleware constructor", async () => {
  const startup = new TestStartup().add(() => TestMiddleware);

  const { ctx } = await startup.run();
  expect(ctx.bag("result")).toBe("test");
});

test("add async function middleware constructor", async () => {
  const startup = new TestStartup().add(async () => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 200);
    });
    return TestMiddleware;
  });

  const { ctx } = await startup.run();
  expect(ctx.bag("result")).toBe("test");
});
