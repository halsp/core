import { Middleware } from "../../src";
import { TestStartup } from "../test-startup";

class TestMiddleware extends Middleware {
  async invoke(): Promise<void> {
    this.ok("test");
  }
}

test("add middleware constructor", async function () {
  const startup = new TestStartup().add(TestMiddleware);

  const result = await startup.run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("test");
});

test("add function middleware constructor", async function () {
  const startup = new TestStartup().add(() => TestMiddleware);

  const result = await startup.run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("test");
});

test("add async function middleware constructor", async function () {
  const startup = new TestStartup().add(async () => {
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 200);
    });
    return TestMiddleware;
  });

  const result = await startup.run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("test");
});
