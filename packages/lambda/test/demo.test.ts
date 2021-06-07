import * as shell from "shelljs";
import * as fs from "fs";

test("demo", async function () {
  shell.cd("./demo");
  try {
    const execResult = shell.exec(`npm run build`);
    expect(execResult.code).toBe(0);
    expect(fs.existsSync("./dist")).toBeTruthy();
    expect(fs.existsSync("./dist/index.js")).toBeTruthy();
    expect(fs.existsSync("./dist/index.d.ts")).toBeTruthy();
    expect(fs.existsSync("./dist/package.json")).toBeFalsy();
  } finally {
    shell.cd("../..");
  }
});
