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
  expect(result.body).toEqual({
    message: "Can't find the path：simple/router1",
    path: "simple/router1",
    status: 404,
  });
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

test("useRouterParser", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/simple/router").setMethod("POST")
  )
    .useRouterParser(routerCfg)
    .use(async (ctx, next) => {
      ctx.setHeader("parser", "added");
      await next();
    })
    .useRouter()
    .run();

  expect(result.status).toBe(200);
  expect(result.getHeader("parser")).toBe("added");
});

function testDefaultUseRouterParser(isNull: boolean) {
  test("useRouterParser default", async function () {
    const result = await new TestStartup(
      new SfaRequest().setPath("/simple/router").setMethod("POST")
    )
      .useRouterParser(isNull ? (null as any) : undefined)
      .useRouter()
      .run();

    expect(result.status).toBe(404);
  });
}
testDefaultUseRouterParser(true);
testDefaultUseRouterParser(false);
