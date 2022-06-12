import { routerPostBuild } from "../src";
import * as fs from "fs";
import { SfaRequest, TestStartup } from "@sfajs/core";
import { CONFIG_FILE_NAME } from "../src/constant";

test("empty config", async () => {
  let count = 0;
  try {
    await routerPostBuild({
      config: {},
      cacheDir: ".sfa-cache",
      mode: "",
      command: "build",
    });
  } catch (err) {
    count++;
    expect((err as Error).message).toBe("The router dir is not exist");
  }
  expect(count).toBe(1);
});

test("build actions", async () => {
  fs.rmSync(`test/${CONFIG_FILE_NAME}`, {
    force: true,
  });

  await routerPostBuild({
    config: {},
    cacheDir: "test",
    mode: "",
    command: "build",
  });

  expect(fs.existsSync(`test/${CONFIG_FILE_NAME}`)).toBeTruthy();
});

test("build and run", async () => {
  await routerPostBuild({
    config: {
      router: {
        dir: "test/actions",
        prefix: "",
        customMethods: [],
      },
    },
    cacheDir: "",
    mode: "",
    command: "build",
  });

  const res = await new TestStartup(new SfaRequest().setMethod("get"))
    .useRouter()
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    method: "GET",
  });
});
