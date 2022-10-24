import { Middleware, Request } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
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
        this.ctx.bag("b1", this.b1);
      }
    }

    const req = new Request();
    req["body"] = {
      b1: "1",
    };
    const { ctx } = await new TestStartup()
      .setSkipThrow()
      .setContext(req)
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .run();

    expect(ctx.bag("b1")).toBeUndefined();
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

    const req = new Request();
    req["body"] = {
      arg: "1",
    };
    const { ctx } = await new TestStartup()
      .setSkipThrow()
      .setContext(req)
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .run();

    expect(ctx.errorStack[0].message).toBe(
      "arg must be a number conforming to the specified constraints"
    );
  });
});
