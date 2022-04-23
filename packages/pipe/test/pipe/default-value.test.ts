import { DefaultValuePipe, DefaultValuePipeOptions } from "../../src";
import { runSuccessPipeTest } from "./utils";

function runTest(
  source: any,
  defaultValue: any,
  target: any,
  options?: DefaultValuePipeOptions
) {
  runSuccessPipeTest(
    [new DefaultValuePipe(defaultValue, options)],
    source,
    target
  );
}

runTest(null, 123, 123);
runTest(undefined, 123, 123);
runTest(null, null, null);
runTest(undefined, undefined, undefined);

runTest("", 123, "", {
  ignoreEmptyString: true,
});
runTest("", 123, 123);

runTest(null, 123, null, {
  ignoreNull: true,
});
runTest(undefined, 123, undefined, {
  ignoreUndefined: true,
});

runTest(parseInt("a"), 123, 123);
runTest(parseInt("a"), 123, NaN, {
  ignoreNaN: true,
});
