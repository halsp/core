import { Middleware, Request, TestStartup } from "@ipare/core";
import { Body, Param } from "../src";

test("null body", async () => {
  class TestMiddleware extends Middleware {
    @Body
    readonly body!: any;
    @Body("field")
    readonly field!: any;
    @Param
    readonly param!: any;

    invoke(): void {
      this.ok({
        body: this.body,
        field: this.field,
        param: this.param,
      });
    }
  }

  const res = await new TestStartup(new Request().setBody(null))
    .useInject()
    .add(TestMiddleware)
    .run();
  expect(res.body).toEqual({
    body: null,
    field: undefined,
    param: undefined,
  });
  expect(res.status).toBe(200);
});
