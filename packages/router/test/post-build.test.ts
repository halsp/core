import { postbuild } from "../src";
import * as fs from "fs";
import { Request, Startup } from "@halsp/core";
import { CONFIG_FILE_NAME } from "../src/constant";
import "@halsp/testing";
import "@halsp/http";
import { runin } from "@halsp/testing";

describe("post build", () => {
  it("should be error when the router dir is not exist", async () => {
    const cacheDir = "temp-test-not-exist";
    let count = 0;
    try {
      await postbuild({
        config: {},
        cacheDir,
      });
    } catch (err) {
      count++;
      expect((err as Error).message).toBe("The router dir is not exist");
    }
    expect(count).toBe(1);
  });

  it("should build router config file", async () => {
    await runin("test/post-build", async () => {
      if (fs.existsSync(CONFIG_FILE_NAME)) {
        fs.rmSync(CONFIG_FILE_NAME, {
          force: true,
        });
      }

      await postbuild({
        config: {
          routerActionsDir: "actions",
        },
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

      await postbuild({
        config: {},
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
