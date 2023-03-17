import { Middleware, Request } from "@halsp/core";
import { TestStartup } from "@halsp/testing";
import { Body } from "@halsp/pipe";
import "@halsp/inject";
import "../src";
import { V, ValidatorEnable } from "../src";

function runTest(validate: boolean) {
  test(`validate ${validate}`, async () => {
    class TestDto {
      b1!: string;

      @V().IsInt()
      b2!: number;

      get b() {
        return this.b1 + this.b2;
      }
    }

    class TestMiddleware extends Middleware {
      @Body
      private readonly body!: TestDto;

      async invoke(): Promise<void> {
        this.ctx.set("body", this.body);
      }
    }

    const req = new Request().setBody({
      b1: "a",
      b2: validate ? 1 : "1",
    });
    const { ctx } = await new TestStartup()
      .setSkipThrow()
      .setContext(req)
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .run();

    const body = ctx.get<TestDto>("body");
    if (validate) {
      expect(body.b).toBe("a1");
      expect(ctx.errorStack.length).toBe(0);
    } else {
      expect(body).toBeUndefined();
      expect(ctx.errorStack[0].message).toBe("b2 must be an integer number");
    }
  });
}

runTest(true);
runTest(false);

test("array message", async () => {
  class TestDto {
    @V().IsInt().IsString()
    b1!: string;

    @V().IsInt()
    b2!: number;

    get b() {
      return this.b1 + this.b2;
    }
  }

  class TestMiddleware extends Middleware {
    @Body
    private readonly body!: TestDto;

    async invoke(): Promise<void> {
      this.ctx.set("body", this.body);
    }
  }

  const req = new Request().setBody({
    b1: 1,
    b2: "1",
  });
  const { ctx } = await new TestStartup()
    .setSkipThrow()
    .setContext(req)
    .useInject()
    .useValidator()
    .add(TestMiddleware)
    .run();

  expect(ctx.get("body")).toBeUndefined();
  expect(ctx.errorStack[0].message).toBe(
    "b1 must be a string, b2 must be an integer number"
  );
});

it("should be undefined when exec V()()", async () => {
  class TestClass {
    //
  }
  expect(V()(TestClass, "")).toBeUndefined();
});

describe("disabled", () => {
  it("should not validate when body type is plain object", async () => {
    class TestMiddleware extends Middleware {
      @Body
      @V
      b!: Record<string, any>;

      async invoke(): Promise<void> {
        this.ctx.set("ok", 1);
      }
    }

    const req = new Request().setBody({
      b1: 1,
    });
    const { ctx } = await new TestStartup()
      .setContext(req)
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .run();

    expect(ctx.get("ok")).toBe(1);
  });

  it("should not validate when disabled by @ValidatorEnable", async () => {
    @ValidatorEnable(() => false)
    class TestClass {
      @V().IsInt()
      b1!: number;
    }

    class TestMiddleware extends Middleware {
      @Body
      @V
      b!: TestClass;

      async invoke(): Promise<void> {
        this.ctx.set("ok", 1);
      }
    }

    const req = new Request().setBody({
      b1: "1",
    });
    const { ctx } = await new TestStartup()
      .setContext(req)
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .run();

    expect(ctx.get("ok")).toBe(1);
  });
});
