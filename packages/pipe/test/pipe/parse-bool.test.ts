import { Middleware } from "@ipare/core";
import { createContext as createHttpContext } from "@ipare/http";
import { TestStartup } from "@ipare/testing";
import { Body, ParseBoolPipe, ParseBoolPipeOptions } from "../../src";
import { runFieldPipeTest, runSuccessPipeTest } from "./utils";
import { createContext as createMicroContext } from "@ipare/micro";
import { MessageItem } from "@ipare/micro/dist/message-item";

function runSuccessTest(
  source: any,
  target: any,
  options?: ParseBoolPipeOptions
) {
  runSuccessPipeTest([new ParseBoolPipe(options)], source, target);
}

function runFieldTest(source: any) {
  runFieldPipeTest([ParseBoolPipe], source);
}

runSuccessTest(1, true);
runSuccessTest(0, false);
runFieldTest(-1);
runFieldTest(2);

runSuccessTest("1", true);
runSuccessTest("0", false);
runFieldTest("2");
runFieldTest("a");

runSuccessTest("t", true);
runSuccessTest("f", false);

runSuccessTest("true", true);
runSuccessTest("false", false);

runSuccessTest(true, true);
runSuccessTest(false, false);

runFieldTest(null);

runSuccessTest("3", true, {
  trueValues: ["3", "4"],
});
runSuccessTest("2", false, {
  falseValues: ["1", "2"],
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

    const ctx = createMicroContext(
      new MessageItem().setData({
        p1: "true",
      })
    );

    await new TestStartup()
      .skipThrow()
      .setContext(ctx)
      .useInject()
      .add(new TestMiddleware())
      .run();

    expect(ctx.bag("p1")).toBeTruthy();
    expect(ctx["result"]).toBeUndefined();
  });

  it(`should not parse bool body property when value is 'abc'`, async () => {
    class TestMiddleware extends Middleware {
      @Body("p1", ParseBoolPipe)
      readonly p1!: any;

      invoke(): void {
        this.ctx.bag("p1", this.p1);
      }
    }

    const ctx = createMicroContext(
      new MessageItem().setData({
        p1: "abc",
      })
    );

    await new TestStartup()
      .skipThrow()
      .setContext(ctx)
      .useInject()
      .add(new TestMiddleware())
      .run();

    expect(ctx.bag("p1")).toBeUndefined();
    expect(ctx["result"]).toEqual({
      message: "Parse bool failed",
      status: "error",
    });
  });

  it(`should not parse bool body property when ctx from http`, async () => {
    class TestMiddleware extends Middleware {
      @Body("p1", ParseBoolPipe)
      readonly p1!: any;

      invoke(): void {
        this.ctx.bag("p1", this.p1);
      }
    }

    const ctx = createHttpContext();

    await new TestStartup()
      .skipThrow()
      .setContext(ctx)
      .useInject()
      .add(new TestMiddleware())
      .run();

    expect(ctx.bag("p1")).toBeUndefined();
    expect(ctx["result"]).toBeUndefined();
  });

  it(`should throw error when msg is undefined`, async () => {
    class TestMiddleware extends Middleware {
      @Body("p1", ParseBoolPipe)
      readonly p1!: any;

      invoke(): void {
        this.ctx.bag("p1", this.p1);
      }
    }

    const ctx = createMicroContext(new MessageItem());
    Object.defineProperty(ctx, "msg", {
      get: () => undefined,
    });

    await new TestStartup()
      .skipThrow()
      .setContext(ctx)
      .useInject()
      .add(new TestMiddleware())
      .run();

    expect(ctx.bag("p1")).toBeUndefined();
    expect(ctx["result"]).toEqual({
      message: "Parse bool failed",
      status: "error",
    });
  });
});
