import { Context, Middleware, Request } from "@ipare/core";
import { TestMicroStartup } from "@ipare/testing/dist/micro";
import { Body, ParseBoolPipe } from "../../src";

beforeAll(() => {
  new TestMicroStartup();
});

describe("parse bool with micro", () => {
  it(`should parse bool body property when value is 'true'`, async () => {
    class TestMiddleware extends Middleware {
      @Body("p1", ParseBoolPipe)
      readonly p1!: any;

      invoke(): void {
        this.ctx.bag("p1", this.p1);
      }
    }

    const req = new Request().setBody({
      p1: "true",
    });

    const { ctx } = await new TestMicroStartup()
      .setSkipThrow()
      .setContext(req)
      .useInject()
      .add(new TestMiddleware())
      .run();

    expect(ctx.bag("p1")).toBeTruthy();
    expect(ctx.res.body).toBeUndefined();
  });

  it(`should not parse bool body property when value is 'abc'`, async () => {
    class TestMiddleware extends Middleware {
      @Body("p1", ParseBoolPipe)
      readonly p1!: any;

      invoke(): void {
        this.ctx.bag("p1", this.p1);
      }
    }

    const ctx = new Context(
      new Request().setBody({
        p1: "abc",
      })
    );

    await new TestMicroStartup()
      .setSkipThrow()
      .setContext(ctx)
      .useInject()
      .add(new TestMiddleware())
      .run();

    expect(ctx.bag("p1")).toBeUndefined();
    expect(ctx.res.body).toBeUndefined();
    expect(ctx.res.status).toBe("error");
    expect(ctx.res.error).toBe("Parse bool failed");
  });

  it(`should throw error when body is undefined`, async () => {
    class TestMiddleware extends Middleware {
      @Body("p1", ParseBoolPipe)
      readonly p1!: any;

      invoke(): void {
        this.ctx.bag("p1", this.p1);
      }
    }

    const ctx = new Context();
    Object.defineProperty(ctx, "body", {
      get: () => undefined,
    });

    await new TestMicroStartup()
      .setSkipThrow()
      .setContext(ctx)
      .useInject()
      .add(new TestMiddleware())
      .run();

    expect(ctx.bag("p1")).toBeUndefined();
    expect(ctx.res.body).toBeUndefined();
    expect(ctx.res.status).toBe("error");
    expect(ctx.res.error).toBe("Parse bool failed");
  });
});
