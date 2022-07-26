import { existsSync } from "fs";
import { runin, shell } from "../src";

test("runin", async () => {
  let run = false;
  await runin(__dirname, () => {
    run = true;
    expect(shell.find("./shell.test.ts")[0]).toBe("./shell.test.ts");
    expect(existsSync("./shell.test.ts")).toBeTruthy();
  });
  expect(run).toBeTruthy();
});
