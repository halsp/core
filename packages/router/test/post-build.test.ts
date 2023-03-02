import { postbuild } from "../src";
import * as fs from "fs";
import { Request } from "@halsp/core";
import { CONFIG_FILE_NAME } from "../src/constant";
import { TestHttpStartup } from "@halsp/testing/dist/http";

test("empty config", async () => {
  let count = 0;
  try {
    await postbuild({
      config: {},
      cacheDir: ".halsp-cache",
    });
  } catch (err) {
    count++;
    expect((err as Error).message).toBe("The router dir is not exist");
  }
  expect(count).toBe(1);
});

test("build and run", async () => {
  await postbuild({
    config: {
      routerActionsDir: "test/actions",
    },
    cacheDir: "",
  });

  const res = await new TestHttpStartup()
    .setContext(new Request().setMethod("get"))
    .useRouter()
    .run();

  fs.rmSync(CONFIG_FILE_NAME, {
    force: true,
  });

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    method: "GET",
  });
});
