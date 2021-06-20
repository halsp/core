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
    expect(TsConfig.cfg).not.toBeUndefined();
    expect(TsConfig.outDir).toBe("./dist");
  });
});

function testConfig(invoke: () => void) {
  if (fs.existsSync(tsconfigPath)) {
    fs.unlinkSync(tsconfigPath);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (TsConfig as any)._default = undefined;

  shell.cd("./test/config");
  try {
    invoke();
  } finally {
    shell.cd("../..");
  }
}
