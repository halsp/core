import { Middleware, Request, TestStartup } from "@ipare/core";
import { Body } from "../../src";

class TestMiddleware extends Middleware {
  @Body(({ value }) => JSON.stringify(value))
  readonly body!: any;

  invoke(): void {
    this.ok(this.body);
  }
}

test("simple test", async () => {
  const res = await new TestStartup(
    new Request().setBody({
      b1: 1,
    })
  )
    .useInject()
    .add(new TestMiddleware())
    .run();
  expect(res.status).toBe(200);
  expect(res.body).toBe(
    JSON.stringify({
      b1: 1,
    })
  );
});
