import { ParseBoolPipe, ParseBoolPipeOptions } from "../../src";
import { runFieldPipeTest, runSuccessPipeTest } from "./utils";

function runSuccessTest(
  source: any,
  target: any,
  options?: ParseBoolPipeOptions,
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
