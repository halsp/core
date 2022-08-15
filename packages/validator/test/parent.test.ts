import { Middleware, Request } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import { Body } from "@ipare/pipe";
import "@ipare/inject";
import "../src";
import { IsBase64, IsNumber, IsString } from "class-validator";

test("parent validate", async () => {
  class TestMiddleware extends Middleware {
    // usless
    @Body
    @IsNumber()
    b: any;

    @Body("b1")
    @IsString()
    @IsBase64()
    b1!: string;

    async invoke(): Promise<void> {
      this.ok({
        b1: this.b1,
      });
    }
  }

  const res = await new TestStartup()
    .skipThrow()
    .setRequest(
      new Request().setBody({
        b1: 1,
      })
    )
    .useInject()
    .useValidator()
    .add(TestMiddleware)
    .run();

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    status: 400,
    message: ["b1 must be base64 encoded", "b1 must be a string"],
  });
});
