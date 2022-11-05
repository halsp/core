import { HttpStartup } from "@ipare/http";
import { Request } from "@ipare/core";
import "../src";
import "./global";
import { TestHttpStartup } from "@ipare/testing-http";
import { DEFAULT_ACTION_DIR } from "../src/constant";
import { runin, TestStartup } from "@ipare/testing";

test("startup test", async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setPath("/simple/RoUtEr").setMethod("POST"))
    .useTestRouter()
    .useRouter()
    .run();
  expect(result.status).toBe(200);
});

test("default", async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setPath("").setMethod("GET"))
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
});

test("startup not exist", async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setPath("/simple/router1").setMethod("POST"))
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
  const res = await new TestHttpStartup()
    .setContext(new Request().setPath("/router").setMethod("POST"))
    .useTestRouter()
    .run();
  expect(res.status).toBe(200);
});

test("deep startup test", async () => {
  const result = await new TestHttpStartup()
    .setContext(
      new Request().setPath("/simple/deepActions/RoUtEr").setMethod("POST")
    )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
});

test("null body test", async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setPath("/nullbody").setMethod("PUT"))
    .useTestRouter()
    .run();

  expect(result.status).toBe(404);
});

describe("useRouterParser", () => {
  it("should not replace options", async () => {
    await new TestHttpStartup()
      .use(async (ctx, next) => {
        await next();
        expect(ctx.routerOptions).toBe(
          (ctx.startup as HttpStartup).routerOptions
        );
        expect(ctx.routerOptions.customMethods).toEqual(["CUSTOM1"]);
      })
      .useTestRouterParser({
        customMethods: ["CUSTOM1"],
      })
      .useRouter({
        customMethods: ["CUSTOM2"],
      })
      .run();
  });

  it("should set default dir", async () => {
    await runin("test", async () => {
      await new TestStartup()
        .use(async (ctx, next) => {
          await next();
          expect(ctx.routerOptions.dir).toBe(DEFAULT_ACTION_DIR);
        })
        .useRouterParser()
        .run();
    });
  });
});
