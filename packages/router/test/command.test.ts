/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from "fs";
import { SfaRequest, TestStartup } from "@sfajs/core";
import * as shell from "shelljs";
import "../src";
import { runin } from "@sfajs/testing";

const baseTsconfig = {
  compilerOptions: {
    lib: ["esnext"],
    module: "commonjs",
    declaration: true,
    outDir: "./dist",
    target: "es2017",
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    noImplicitAny: false,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
  },
  include: ["src/**/*"],
  static: [
    {
      source: "static",
      target: "assets",
    },
    "static.txt",
  ],
};

test("build with parent outDir", async () => {
  await runin("./test/command", async () => {
    const tsconfig = JSON.parse(JSON.stringify(baseTsconfig));

    tsconfig.compilerOptions.outDir = "../functions/v1";
    fs.writeFileSync("./tsconfig.json", JSON.stringify(tsconfig));

    const execResult = shell.exec(`npm run build`);
    expect(execResult.code).toBe(0);
    expectFile(tsconfig.compilerOptions.outDir);
  });
});

function expectFile(outDir: string) {
  expect(fs.existsSync(outDir)).toBe(true);
  expect(fs.existsSync(`${outDir}/static.txt`)).toBe(true);
  expect(fs.existsSync(`${outDir}/static/file1.txt`)).toBe(true);
  expect(fs.existsSync(`${outDir}/static/file2.txt`)).toBe(true);
  expect(fs.existsSync(`${outDir}/README.md`)).toBe(false);
}

test("run and build", async () => {
  await runin("./test/command", async () => {
    await fs.promises.writeFile("tsconfig.json", JSON.stringify(baseTsconfig));

    const execResult = shell.exec(`npm run build`);
    expect(execResult.code).toBe(0);

    await runin("dist", async () => {
      const result = await new TestStartup(new SfaRequest().setMethod("get"))
        .useRouter()
        .run();
      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        method: "GET",
      });
    });
  });
});
