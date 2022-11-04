import { Middleware, Request } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import { Body } from "@ipare/pipe";
import "@ipare/inject";
import "../src";
import { V } from "../src";

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
        this.ctx.bag("body", this.body);
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

    const body = ctx.bag<TestDto>("body");
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
      this.ctx.bag("body", this.body);
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

  expect(ctx.bag("body")).toBeUndefined();
  expect(ctx.errorStack[0].message).toBe(
    "b1 must be a string, b2 must be an integer number"
  );
});

test("validate disabled", async () => {
  class TestMiddleware extends Middleware {
    @Body
    b!: Record<string, any>;

    async invoke(): Promise<void> {
      this.ctx.bag("ok", 1);
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

  expect(ctx.bag("ok")).toBe(1);
});

it("should be undefined when exec V()()", async () => {
  class TestClass {
    //
  }
  expect(V()(TestClass, "")).toBeUndefined();
});
