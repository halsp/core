import { ParseBoolPipe } from "../../src";
import { runFieldPipeTest, runSuccessPipeTest } from "./utils";

function runSuccessTest(source: any, target: any) {
  runSuccessPipeTest([ParseBoolPipe], source, target);
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

runSuccessTest(true, true);
runSuccessTest(false, false);

runFieldTest(null);
