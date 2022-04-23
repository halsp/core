import { runSuccessPipeTest } from "./utils";

runSuccessPipeTest([(val) => Number(val)], "123", 123);
