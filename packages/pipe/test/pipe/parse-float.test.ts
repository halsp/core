import { ParseFloatPipe } from "../../src";
import { runPipeTest } from "./utils";

function testParseFloat(source: any, target?: any) {
  runPipeTest([ParseFloatPipe], source, target);
}

testParseFloat("123", 123);
testParseFloat("0", 0);
testParseFloat("-345", -345);
testParseFloat("");
testParseFloat("a");
