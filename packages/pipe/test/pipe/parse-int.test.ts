import { ParseIntPipe } from "../../src";
import { runFieldPipeTest, runSuccessPipeTest } from "./utils";

function runSuccessTest(source: any, target: any) {
  runSuccessPipeTest([ParseIntPipe], source, target);
}

function runFieldTest(source: any) {
  runFieldPipeTest([ParseIntPipe], source);
}

runSuccessTest("123", 123);
runSuccessTest("0", 0);
runSuccessTest("-345", -345);
runFieldTest("");
runFieldTest("a");
