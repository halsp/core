import "@halsp/http";
import { Request, Startup } from "@halsp/core";
import "../src";
import "./utils";
import {
  DEFAULT_ACTION_DIR,
  HALSP_ROUTER_DIR,
  ROUTER_INITED_OPTIONS_BAG,
} from "../src/constant";
import { runin } from "@halsp/testing";

test("startup test", async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(new Request().setPath("/simple/RoUtEr").setMethod("POST"))
    .useTestRouter()
    .useRouter()
    .test();
  expect(result.status).toBe(200);
});

test("default", async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(new Request().setPath("").setMethod("GET"))
    .useTestRouter()
    .test();
  expect(result.status).toBe(200);
});

test("startup not exist", async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(new Request().setPath("/simple/router1").setMethod("POST"))
    .useTestRouter()
    .test();
  expect(result.status).toBe(404);
  expect(result.body).toEqual({
    message: "Can't find the path：simple/router1",
    path: "simple/router1",
    status: 404,
  });
});

test("shallow startup test", async () => {
  const res = await new Startup()
    .useHttp()
    .setContext(new Request().setPath("/router").setMethod("POST"))
    .useTestRouter()
    .test();
  expect(res.status).toBe(200);
});

test("deep startup test", async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(
      new Request().setPath("/simple/deepActions/RoUtEr").setMethod("POST"),
    )
    .useTestRouter()
    .test();
  expect(result.status).toBe(200);
});

test("null body test", async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(new Request().setPath("/nullbody").setMethod("PUT"))
    .useTestRouter()
    .test();

  expect(result.status).toBe(404);
});

describe("options", () => {
  it("should not replace options", async () => {
    await new Startup()
      .keepThrow()
      .useHttp()
      .use(async (ctx, next) => {
        await next();
        expect(ctx.get<any>(ROUTER_INITED_OPTIONS_BAG).prefix).toEqual("p1");
      })
      .useTestRouter({
        prefix: "p1",
      })
      .useTestRouter({
        prefix: "p2",
      })
      .test();
  });

  it("should set default dir", async () => {
    await runin("test", async () => {
      delete process.env[HALSP_ROUTER_DIR];

      await new Startup()
        .use(async (ctx, next) => {
          await next();
          expect(ctx.get<any>(ROUTER_INITED_OPTIONS_BAG).dir).toBe(
            DEFAULT_ACTION_DIR,
          );
        })
        .useRouter()
        .test();
    });
  });
});
