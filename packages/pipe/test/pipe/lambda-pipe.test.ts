import { runPipeTest } from "./utils";

function testParseBool(source: any, target?: any) {
  runPipeTest([(val) => Number(val)], source, target);
}

testParseBool("123", 123);
