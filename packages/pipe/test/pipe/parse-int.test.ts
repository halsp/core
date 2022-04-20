import { ParseIntPipe } from "../../src";
import { runPipeTest } from "./utils";

function testParseInt(source: any, target?: any) {
  runPipeTest([ParseIntPipe], source, target);
}

testParseInt("123", 123);
testParseInt("0", 0);
testParseInt("-345", -345);
testParseInt("");
testParseInt("a");
