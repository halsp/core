import { Config } from "../../src";
import * as shell from "shelljs";
import * as path from "path";
import * as fs from "fs";
import Constant from "../../src/Constant";

const configPath = path.join(process.cwd(), "test/config/sfa-router.json");
const tsconfigPath = path.join(process.cwd(), "test/config/tsconfig.json");

test("not exist", function () {
  testConfig(() => {
    expect(Config.default).toEqual({});
    expect(Config.tsconfig).toBeNull();
    if (!fs.existsSync(Constant.defaultRouterDir)) {
      fs.mkdirSync(Constant.defaultRouterDir);
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(Config.getRouterDirPath(null as any)).toBe(
        Constant.defaultRouterDir
      );
    } finally {
      fs.rmdirSync(Constant.defaultRouterDir);
    }
  });
});

test("simple config", function () {
  testConfig(() => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        router: {
          dir: "../controllers",
        },
      })
    );
    expect(Config.default).not.toBeUndefined();
    expect(Config.default).toBe(Config.default);

    expect(Config.outDir).toBe("");
    expect(Config.getRouterDirPath(Config.default).replace(/\\/g, "/")).toBe(
      "../controllers"
    );
  });
});

test("the router dir is not exist", function () {
  testConfig(() => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        router: {
          dir: "../1controllers",
        },
      })
    );
    expect(() => Config.getRouterDirPath(Config.default)).toThrow(
      Error("the router dir is not exist")
    );
  });
});

test("default router dir not exist", function () {
  testConfig(() => {
    fs.writeFileSync(configPath, JSON.stringify({ router: {} }));
    expect(() => Config.getRouterDirPath(Config.default)).toThrow(
      Error("the router dir is not exist")
    );
  });
});

test("no router config", function () {
  testConfig(() => {
    fs.writeFileSync(configPath, JSON.stringify({}));
    expect(() => Config.getRouterDirPath(Config.default)).toThrow(
      Error("the router dir is not exist")
    );
  });
});

test("ts config", function () {
  testConfig(() => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        router: {
          dir: "../controllers",
        },
      })
    );
    fs.writeFileSync(
      tsconfigPath,
      JSON.stringify({
        compilerOptions: {
          outDir: "./dist",
        },
      })
    );
    expect(Config.tsconfig).not.toBeUndefined();
    expect(Config.outDir).toBe("./dist");
  });
});

function testConfig(invoke: () => void) {
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
  }
  if (fs.existsSync(tsconfigPath)) {
    fs.unlinkSync(tsconfigPath);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Config as any)._default = undefined;

  shell.cd("./test/config");
  try {
    invoke();
  } finally {
    shell.cd("../..");
  }
}
