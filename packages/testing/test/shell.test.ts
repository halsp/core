import { existsSync } from "fs";
import { runin } from "../src";

test("runin", async () => {
  let run = false;
  await runin(__dirname, () => {
    run = true;
    expect(existsSync("./shell.test.ts")).toBeTruthy();
  });
  expect(run).toBeTruthy();
});
