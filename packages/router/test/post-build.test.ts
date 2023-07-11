import { postbuild } from "../src";
import * as fs from "fs";
import { Request, Startup } from "@halsp/core";
import { CONFIG_FILE_NAME, HALSP_ROUTER_DIR } from "../src/constant";
import "@halsp/testing";
import "@halsp/http";
import { runin } from "@halsp/testing";
import path from "path";
import { DEFAULT_ACTION_DIR } from "../src/constant";

describe("post build", () => {
  it("should be empty when the router dir is not exist", async () => {
    await runin("test/post-build", async () => {
      const cacheDir = "temp-test-not-exist";
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      delete process.env[HALSP_ROUTER_DIR];
      await postbuild({
        cacheDir,
      });

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const config = JSON.parse(
        fs.readFileSync(path.resolve(cacheDir, CONFIG_FILE_NAME), "utf-8")
      );
      expect(config).toEqual({
        dir: DEFAULT_ACTION_DIR,
        map: [],
      });
    });
  });

  it("should build router config file", async () => {
    await runin("test/post-build", async () => {
      if (fs.existsSync(CONFIG_FILE_NAME)) {
        fs.rmSync(CONFIG_FILE_NAME, {
          force: true,
        });
      }

      process.env[HALSP_ROUTER_DIR] = "actions";
      await postbuild({
        cacheDir: "",
      });

      const res = await new Startup()
        .useHttp()
        .setContext(new Request().setMethod("get"))
        .useRouter()
        .test();

      expect(fs.existsSync(CONFIG_FILE_NAME)).toBeTruthy();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        method: "GET",
      });
    });
  });

  it("should find default dir modules first", async () => {
    await runin("test/post-build", async () => {
      if (fs.existsSync(CONFIG_FILE_NAME)) {
        fs.rmSync(CONFIG_FILE_NAME, {
          force: true,
        });
      }

      delete process.env[HALSP_ROUTER_DIR];
      await postbuild({
        cacheDir: "",
      });

      const res = await new Startup()
        .useHttp()
        .setContext(new Request().setMethod("get"))
        .useRouter()
        .test();

      expect(
        fs.readFileSync(CONFIG_FILE_NAME, "utf-8").includes(`"modules-first":1`)
      ).toBeTruthy();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        modules: true,
      });
    });
  });
});
