import { TestStartup, SfaRequest } from "@sfajs/core";
import "../src";
import { routerCfg } from "./global";

test("startup test", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/RoUtEr").setMethod("POST")
  )
    .useRouter(routerCfg)
    .useRouter(routerCfg)
    .run();
  expect(result.status).toBe(200);
});

test("startup not exist", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/router1").setMethod("POST")
  )
    .useRouter(routerCfg)
    .run();
  expect(result.status).toBe(404);
  expect(result.body).toEqual({
    message: "Can't find the path：simple/router1",
    path: "simple/router1",
    status: 404,
  });
});

test("shallow startup test", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/router").setMethod("POST")
  )
    .useRouter(routerCfg)
    .run();
  expect(result.status).toBe(200);
});

test("deep startup test", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/deepActions/RoUtEr").setMethod("POST")
  )
    .useRouter(routerCfg)
    .run();
  expect(result.status).toBe(200);
});

test("null body test", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/nullbody").setMethod("PUT")
  )
    .useRouter(routerCfg)
    .run();

  expect(result.status).toBe(404);
});

test("null config", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("").setMethod("GET")
  )
    .useRouter(null as any)
    .run();

  expect(result.status).toBe(404);
});
