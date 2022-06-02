/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from "fs";
import { TestStartup } from "@sfajs/core";
import * as shell from "shelljs";
import "../src";
import { runin } from "@sfajs/testing";

test("sfa build command", async () => {
  await runin("./test/command", async () => {
    const tsconfigStr = fs.readFileSync("./tsconfig-back.json", "utf-8");
    const tsconfig = JSON.parse(tsconfigStr);

    tsconfig.compilerOptions.outDir = "../functions/v1";
    fs.writeFileSync("./tsconfig.json", JSON.stringify(tsconfig));

    {
      const execResult = shell.exec(`npm run build`);
      expect(execResult.code).toBe(0);
      expectFile(tsconfig.compilerOptions.outDir);
    }

    tsconfig.compilerOptions.outDir = "./dist";
    fs.writeFileSync("./tsconfig.json", JSON.stringify(tsconfig));

    {
      const execResult = shell.exec(`npm run build`);
      expect(execResult.code).toBe(0);
      expectFile(tsconfig.compilerOptions.outDir);
    }
  });
});

function expectFile(outDir: string) {
  expect(fs.existsSync(outDir)).toBe(true);
  expect(fs.existsSync(`${outDir}/static.txt`)).toBe(true);
  expect(fs.existsSync(`${outDir}/static/file1.txt`)).toBe(true);
  expect(fs.existsSync(`${outDir}/static/file2.txt`)).toBe(true);
  expect(fs.existsSync(`${outDir}/README.md`)).toBe(false);
}

test("run", async () => {
  await runin("./test/command", async () => {
    const result = await new TestStartup().useRouter().run();
    expect(result.status).toBe(404);
  });
});
