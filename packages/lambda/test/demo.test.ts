import * as shell from "shelljs";
import * as fs from "fs";

test("demo", async function () {
  const routerMapPath = `./dist/sfa-router.map`;
  shell.cd("./demo");
  try {
    if (fs.existsSync(routerMapPath)) {
      fs.unlinkSync(routerMapPath);
    }

    const execResult = shell.exec(`npm i && npm run build`);
    expect(execResult.code).toBe(0);
    expect(fs.existsSync(routerMapPath)).toBeTruthy();
    expect(fs.existsSync("./dist")).toBeTruthy();
    expect(fs.existsSync("./dist/sfa-router.map")).toBeTruthy();
    expect(fs.existsSync("./README.md")).toBeFalsy();
  } finally {
    shell.cd("../..");
  }
});
