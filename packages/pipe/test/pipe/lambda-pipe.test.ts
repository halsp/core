import { runSuccessPipeTest } from "./utils";

runSuccessPipeTest([({ value }) => Number(value)], "123", 123);
