import { TsConfig } from "../../src";
import * as shell from "shelljs";
import * as path from "path";
import * as fs from "fs";

const tsconfigPath = path.join(process.cwd(), "test/config/tsconfig.json");

test("ts config", function () {
  testConfig(() => {
    fs.writeFileSync(
      tsconfigPath,
      JSON.stringify({
        compilerOptions: {
          outDir: "./dist",
        },
      })
    );
    expect(TsConfig.cfg).toEqual({
      compilerOptions: {
        outDir: "./dist",
      },
    });
    expect(TsConfig.outDir).toBe("./dist");
    expect(TsConfig.tsStatic).toEqual([]);
  });
});

test("ts static", function () {
  testConfig(() => {
    fs.writeFileSync(
      tsconfigPath,
      JSON.stringify({
        compilerOptions: {
          outDir: "./dist",
        },
        static: ["static.txt"],
      })
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (TsConfig as any)._cfg = undefined;

    expect(TsConfig.tsStatic).toEqual(["static.txt"]);
  });
});

test("not exist", function () {
  testConfig(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (TsConfig as any)._cfg = undefined;

    expect(TsConfig.cfg).toBeNull();
    expect(TsConfig.outDir).toBe("");
    expect(TsConfig.tsStatic).toEqual([]);
  });
});

function testConfig(invoke: () => void) {
  if (fs.existsSync(tsconfigPath)) {
    fs.unlinkSync(tsconfigPath);
  }

  shell.cd("./test/config");
  try {
    invoke();
  } finally {
    shell.cd("../..");
  }
}
