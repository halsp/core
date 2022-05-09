import { existsSync } from "fs";
import { runin, shell } from "../src";

test("runin", async () => {
  let run = false;
  await runin("test", () => {
    run = true;
    expect(shell.find("./shell.test.ts")[0]).toBe("./shell.test.ts");
    expect(existsSync("./shell.test.ts")).toBeTruthy();
  });
  expect(run).toBeTruthy();
});
