import { TestStartup, SfaRequest } from "@sfajs/core";
import "../src";
import { routerCfg } from "./global";

test("startup test", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/RoUtEr").setMethod("POST")
  )
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

test("onParserAdded", async function () {
  const cfg = routerCfg;
  cfg.onParserAdded = (startup) => {
    startup.use(async (ctx, next) => {
      ctx.setHeader("parser", "added");
      await next();
    });
  };
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/router").setMethod("POST")
  )
    .useRouter(cfg)
    .run();

  expect(result.status).toBe(200);
  expect(result.getHeader("parser")).toBe("added");
});
