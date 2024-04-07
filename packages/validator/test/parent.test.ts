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
      @V().IsNumber()
      b: any;

      @Body("b1")
      @V().IsString().IsBase64()
      b1!: string;

      async invoke(): Promise<void> {
        this.ctx.set("b1", this.b1);
      }
    }

    const req = new Request().setBody({
      b1: "1",
    });
    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("b1 must be base64 encoded");
      })
      .expect(({ ctx }) => {
        expect(ctx.get("b1")).toBeUndefined();
      })
      .setContext(req)
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .test();
  });

  it("should validate parameter pipe", async () => {
    @Inject
    class TestMiddleware extends Middleware {
      constructor(@V().IsNumber() @Body("arg") private arg: number) {
        super();
      }

      async invoke(): Promise<void> {
        //
      }
    }

    const req = new Request().setBody({
      arg: "1",
    });
    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe(
          "arg must be a number conforming to the specified constraints",
        );
      })
      .setContext(req)
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .test();
  });
});
