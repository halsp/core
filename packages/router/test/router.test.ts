import { TestStartup, SfaRequest } from "sfa";
import "./UseTest";
import "../src";
import { nextTick } from "process";

test("startup test", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/RoUtEr").setMethod("POST")
  )
    .useTest()
    .useRouter()
    .run();
  expect(result.status).toBe(200);
});

test("startup not exist", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/router1").setMethod("POST")
  )
    .useTest()
    .useRouter()
    .run();
  expect(result.status).toBe(404);
});

test("shallow startup test", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/router").setMethod("POST")
  )
    .useTest()
    .useRouter()
    .run();
  expect(result.status).toBe(200);
});

test("deep startup test", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/deepActions/RoUtEr").setMethod("POST")
  )
    .useTest()
    .useRouter()
    .run();
  expect(result.status).toBe(200);
});

test("null body test", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/nullbody").setMethod("PUT")
  )
    .useTest()
    .useRouter()
    .run();

  expect(result.status).toBe(404);
});

test("useRouterParser", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/router").setMethod("POST")
  )
    .useTest()
    .useRouterParser("test/controllers")
    .use(async (ctx, next) => {
      ctx.setHeader("map-path", ctx.routerMapItem.path);
      await next();
    })
    .useRouter()
    .run();

  expect(result.status).toBe(200);
  expect(result.getHeader("map-path")).toBe("simple/Router.ts");
});
