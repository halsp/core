import { Context, Middleware, Request, Startup } from "@halsp/core";
import "@halsp/testing";
import "@halsp/micro";
import { Body, ParseBoolPipe } from "../../src";

describe("parse bool with micro", () => {
  it(`should parse bool body property when value is 'true'`, async () => {
    class TestMiddleware extends Middleware {
      @Body("p1", ParseBoolPipe)
      readonly p1!: any;

      invoke(): void {
        this.ctx.set("p1", this.p1);
      }
    }

    const req = new Request().setBody({
      p1: "true",
    });

    const { ctx } = await new Startup()
      .useMicro()
      .setSkipThrow()
      .setContext(req)
      .useInject()
      .add(new TestMiddleware())
      .test();

    expect(ctx.get("p1")).toBeTruthy();
    expect(ctx.res.body).toBeUndefined();
  });

  it(`should not parse bool body property when value is 'abc'`, async () => {
    class TestMiddleware extends Middleware {
      @Body("p1", ParseBoolPipe)
      readonly p1!: any;

      invoke(): void {
        this.ctx.set("p1", this.p1);
      }
    }

    const ctx = new Context(
      new Request().setBody({
        p1: "abc",
      })
    );

    await new Startup()
      .useMicro()
      .setSkipThrow()
      .setContext(ctx)
      .useInject()
      .add(new TestMiddleware())
      .test();

    expect(ctx.get("p1")).toBeUndefined();
    expect(ctx.res.body).toBeUndefined();
    expect(ctx.res.error).toBe("Parse bool failed");
  });

  it(`should throw error when body is undefined`, async () => {
    class TestMiddleware extends Middleware {
      @Body("p1", ParseBoolPipe)
      readonly p1!: any;

      invoke(): void {
        this.ctx.set("p1", this.p1);
      }
    }

    const ctx = new Context();
    Object.defineProperty(ctx, "body", {
      get: () => undefined,
    });

    await new Startup()
      .useMicro()
      .setSkipThrow()
      .setContext(ctx)
      .useInject()
      .add(new TestMiddleware())
      .test();

    expect(ctx.get("p1")).toBeUndefined();
    expect(ctx.res.body).toBeUndefined();
    expect(ctx.res.error).toBe("Parse bool failed");
  });
});
