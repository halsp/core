import { TrimPipe, TrimPipeOptions } from "../../src";
import { runFieldPipeTest, runSuccessPipeTest } from "./utils";

function runSuccessTest(source: any, target: any, options?: TrimPipeOptions) {
  runSuccessPipeTest([new TrimPipe(options)], source, target);
}

function runFieldTest(source: any, options?: TrimPipeOptions, target?: any) {
  runFieldPipeTest([new TrimPipe(options)], source, target);
}

runSuccessTest("", "");
runSuccessTest("123 ", "123");
runSuccessTest(" 123", "123");
runSuccessTest(" 123 ", "123");
runSuccessTest(" 123 ", "123 ", { end: false });
runSuccessTest(" 123 ", " 123", { start: false });
runSuccessTest(" 123 ", " 123 ", { end: false, start: false });

runFieldTest(123);
runSuccessTest(123, "1234", {
  notString: (val) => String(val) + "4",
});

runFieldTest(null);
runFieldTest(undefined);
