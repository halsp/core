import "../src";
import "@halsp/http";
import "@halsp/testing";
import { Startup } from "@halsp/core";

test("arr header type", async function () {
  const res = await new Startup()
    .koa(async (ctx, next) => {
      ctx.body = "halsp";
      ctx.status = 200;
      ctx.set("Content-Type", ["text/plain", "charset=utf-8"]);
      await next();
    })
    .runTest();

  expect(res.status).toBe(200);
  expect(res.body).toBe("halsp");
  expect(res.getHeader("content-type")).toEqual([
    "text/plain",
    "charset=utf-8",
  ]);
});

test("without type", async function () {
  const res = await new Startup()
    .useHttp()
    .koa(async (ctx, next) => {
      ctx.body = "halsp";
      ctx.status = 200;
      ctx.set("Content-Type", "");
      await next();
    })
    .runTest();

  expect(res.status).toBe(200);
  expect(res.body).toBe("halsp");
  expect(res.getHeader("content-type")).toBe("text/plain; charset=utf-8");
});
