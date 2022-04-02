import { TestStartup, Middleware } from "../../src";

class TestMiddleware extends Middleware {
  async invoke(): Promise<void> {
    this.ok("test");
  }
}

test("simpple middleware", async function () {
  const startup = new TestStartup().add(TestMiddleware);

  const result = await startup.run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("test");
});
