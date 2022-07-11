import { TestStartup, Request } from "@ipare/core";
import "../src";
import "./global";
import * as fs from "fs";
import { CONFIG_FILE_NAME } from "../src/constant";

test("startup test", async () => {
  const result = await new TestStartup(
    new Request().setPath("/simple/RoUtEr").setMethod("POST")
  )
    .useTestRouter()
    .useRouter()
    .run();
  expect(result.status).toBe(200);
});

test("default", async () => {
  const result = await new TestStartup(
    new Request().setPath("").setMethod("GET")
  )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
});

test("startup not exist", async () => {
  const result = await new TestStartup(
    new Request().setPath("/simple/router1").setMethod("POST")
  )
    .useTestRouter()
    .run();
  expect(result.status).toBe(404);
  expect(result.body).toEqual({
    message: "Can't find the path：simple/router1",
    path: "simple/router1",
    status: 404,
  });
});

test("shallow startup test", async () => {
  const res = await new TestStartup(
    new Request().setPath("/router").setMethod("POST")
  )
    .useTestRouter()
    .run();
  expect(res.status).toBe(200);
});

test("deep startup test", async () => {
  const result = await new TestStartup(
    new Request().setPath("/simple/deepActions/RoUtEr").setMethod("POST")
  )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
});

test("null body test", async () => {
  const result = await new TestStartup(
    new Request().setPath("/nullbody").setMethod("PUT")
  )
    .useTestRouter()
    .run();

  expect(result.status).toBe(404);
});

test("blank config", async () => {
  let waitTimes = 0;
  while (fs.existsSync(CONFIG_FILE_NAME)) {
    waitTimes++;
    if (waitTimes > 10) {
      throw new Error("timeout");
    }
    await new Promise((resolve) => {
      setTimeout(() => resolve, 200);
    });
  }

  let done = false;
  try {
    await new TestStartup(new Request().setPath("").setMethod("GET"))
      .useRouter()
      .run();
  } catch (err) {
    done = true;
    expect((err as Error).message).toBe("The router dir is not exist");
  }
  expect(done).toBeTruthy();
});
