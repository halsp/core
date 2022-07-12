import "../src";
import { TestStartup, Request } from "@ipare/core";
import Koa from "koa";

test("text", async function () {
  const res = await new TestStartup(new Request().setBody("ipare"))
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.body = ctx.ipareCtx.req.body;
        ctx.status = 200;
        await next();
      })
    )
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("ipare");
  expect(res.getHeader("content-type")).toBe("text/plain; charset=utf-8");
});

test("json", async function () {
  const res = await new TestStartup(
    new Request().setBody({
      ipare: "koa",
    })
  )
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.body = ctx.ipareCtx.req.body;
        ctx.status = 200;
        await next();
      })
    )
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    ipare: "koa",
  });
  expect(res.getHeader("content-type")).toBe("application/json; charset=utf-8");
});

test("buffer", async function () {
  const res = await new TestStartup(
    new Request().setBody(Buffer.from("ipare", "utf-8"))
  )
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.body = ctx.ipareCtx.req.body;
        ctx.status = 200;
        await next();
      })
    )
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual(Buffer.from("ipare", "utf-8"));
  expect(res.getHeader("content-type")).toBe("application/octet-stream");
});
