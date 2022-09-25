import { Middleware } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import { ParseBoolPipe, ParseBoolPipeOptions, Payload } from "../../src";
import { runFieldPipeTest, runSuccessPipeTest } from "./utils";
import { createContext } from "@ipare/micro/dist/context";

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

function testPayload(success: boolean) {
  function run(payload: boolean) {
    test(`parse bool payload property ${success} ${payload}`, async () => {
      class TestMiddleware extends Middleware {
        @Payload("p1", ParseBoolPipe)
        readonly p1!: any;

        invoke(): void {
          this.ctx.bag("p1", this.p1);
        }
      }

      const ctx = createContext({
        p1: success ? "true" : "abc",
      });
      if (!payload) {
        delete ctx["payload"];
      }
      await new TestStartup()
        .skipThrow()
        .setContext(ctx)
        .useInject()
        .add(new TestMiddleware())
        .run();
      if (success) {
        if (payload) {
          expect(ctx["result"]).toBeUndefined();
          expect(ctx.bag("p1")).toBeTruthy();
        } else {
          expect(ctx.bag("p1")).toBeUndefined();
          expect(ctx["result"]).toEqual({
            status: "error",
            message: "Parse bool failed",
          });
        }
      } else {
        expect(ctx.bag("p1")).toBeUndefined();
        expect(ctx["result"]).toEqual({
          status: "error",
          message: "Parse bool failed",
        });
      }
    });
  }
  run(true);
  run(false);
}
testPayload(true);
testPayload(false);
