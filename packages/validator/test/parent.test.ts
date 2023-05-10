import { Middleware, Request, Startup } from "@halsp/core";
import "@halsp/testing";
import { Body } from "@halsp/pipe";
import "@halsp/inject";
import "../src";
import { V } from "../src";
import { Inject } from "@halsp/inject";

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
        this.ctx.set("b1", this.b1);
      }
    }

    const req = new Request().setBody({
      b1: "1",
    });
    const { ctx } = await new Startup()
      .setSkipThrow()
      .setContext(req)
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .test();

    expect(ctx.get("b1")).toBeUndefined();
    expect(ctx.errorStack[0].message).toBe("b1 must be base64 encoded");
  });

  it("should validate parameter pipe", async () => {
    @Inject
    class TestMiddleware extends Middleware {
      constructor(@V.IsNumber() @Body("arg") private arg: number) {
        super();
      }

      async invoke(): Promise<void> {
        //
      }
    }

    const req = new Request().setBody({
      arg: "1",
    });
    const { ctx } = await new Startup()
      .setSkipThrow()
      .setContext(req)
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .test();

    expect(ctx.errorStack[0].message).toBe(
      "arg must be a number conforming to the specified constraints"
    );
  });
});
