import * as shell from "shelljs";
import * as fs from "fs";
import { MAP_FILE_NAME } from "../src/constant";

test("js demo", async function () {
  const routerMapPath = `./${MAP_FILE_NAME}`;
  shell.cd("./demo/js");
  try {
    if (fs.existsSync(routerMapPath)) {
      fs.unlinkSync(routerMapPath);
    }

    const execResult = shell.exec(`npm run build`);
    expect(execResult.code).toBe(0);
    expect(fs.existsSync(routerMapPath)).toBeTruthy();
  } finally {
    shell.cd("../..");
  }
});

test("ts demo", async function () {
  const routerMapPath = `./dist/${MAP_FILE_NAME}`;
  shell.cd("./demo/ts");
  try {
    if (fs.existsSync(routerMapPath)) {
      fs.unlinkSync(routerMapPath);
    }

    const execResult = shell.exec(`npm run build`);
    expect(execResult.code).toBe(0);
    expect(fs.existsSync(routerMapPath)).toBeTruthy();
    expect(fs.existsSync("./dist")).toBeTruthy();
    expect(fs.existsSync("./README.md")).toBeFalsy();
  } finally {
    shell.cd("../..");
  }
});
