/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from "fs";
import { TestStartup } from "sfa";
import * as shell from "shelljs";
import "../src";

test.skip("sfa build command", async function () {
  shell.cd("./test/command");

  try {
    const tsconfigPath = "./tsconfig.json";
    const tsconfigStr = fs.readFileSync(tsconfigPath, "utf-8");
    const tsconfig = JSON.parse(tsconfigStr);
    tsconfig.compilerOptions.outDir = "../functions/v1";
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig));

    try {
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
    } finally {
      fs.writeFileSync("./tsconfig.json", tsconfigStr);
    }
  } finally {
    shell.cd("../..");
  }
});

function expectFile(outDir: string) {
  expect(fs.existsSync(outDir)).toBe(true);
  expect(fs.existsSync(`${outDir}/static.txt`)).toBe(true);
  expect(fs.existsSync(`${outDir}/assets/file1.txt`)).toBe(true);
  expect(fs.existsSync(`${outDir}/assets/file2.txt`)).toBe(true);
  expect(fs.existsSync(`${outDir}/README.md`)).toBe(false);
}

test.skip("run", async function () {
  shell.cd("./test/command");

  try {
    const result = await new TestStartup().useRouter().run();
    expect(result.status).toBe(404);
  } finally {
    shell.cd("../..");
  }
});
