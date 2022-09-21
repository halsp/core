import { Request } from "@ipare/http";
import { Middleware } from "@ipare/core";
import { TestHttpStartup } from "@ipare/testing";
import { Body } from "@ipare/pipe";
import "@ipare/inject";
import "../src";
import { V } from "../src";
import { Inject } from "@ipare/inject";

describe("parent validate", () => {
  it("should validate property pipe", async () => {
    class TestMiddleware extends Middleware {
      // usless
      @Body
      @V.IsNumber()
      b: any;

      @Body("b1")
      @V.IsString().IsBase64()
      b1!: string;

      async invoke(): Promise<void> {
        this.ok({
          b1: this.b1,
        });
      }
    }

    const res = await new TestHttpStartup()
      .skipThrow()
      .setRequest(
        new Request().setBody({
          b1: "1",
        })
      )
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .run();

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      status: 400,
      message: "b1 must be base64 encoded",
    });
  });

  it("should validate parameter pipe", async () => {
    @Inject
    class TestMiddleware extends Middleware {
      constructor(@V.IsNumber() @Body("arg") private arg: number) {
        super();
      }

      async invoke(): Promise<void> {
        this.ok();
      }
    }

    const res = await new TestHttpStartup()
      .skipThrow()
      .setRequest(
        new Request().setBody({
          arg: "1",
        })
      )
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .run();

    expect(res.body).toEqual({
      status: 400,
      message: "arg must be a number conforming to the specified constraints",
    });
    expect(res.status).toBe(400);
  });
});
