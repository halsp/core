import { ParseBoolPipe } from "../../src";
import { runPipeTest } from "./utils";

function testParseBool(source: any, target?: any) {
  runPipeTest([ParseBoolPipe], source, target);
}

testParseBool(1, true);
testParseBool(0, false);
testParseBool(-1);
testParseBool(2);

testParseBool("1", true);
testParseBool("0", false);
testParseBool("2");
testParseBool("a");

testParseBool(true, true);
testParseBool(false, false);

testParseBool(null);
