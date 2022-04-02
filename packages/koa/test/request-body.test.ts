import "../src";
import { TestStartup, SfaRequest } from "@sfajs/core";
import Koa from "koa";

test("text", async function () {
  const res = await new TestStartup(new SfaRequest().setBody("sfa"))
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.body = ctx.sfaCtx.req.body;
        ctx.status = 200;
        await next();
      })
    )
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("sfa");
  expect(res.getHeader("content-type")).toBe("text/plain; charset=utf-8");
});

test("json", async function () {
  const res = await new TestStartup(
    new SfaRequest().setBody({
      sfa: "koa",
    })
  )
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.body = ctx.sfaCtx.req.body;
        ctx.status = 200;
        await next();
      })
    )
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    sfa: "koa",
  });
  expect(res.getHeader("content-type")).toBe("application/json; charset=utf-8");
});

test("buffer", async function () {
  const res = await new TestStartup(
    new SfaRequest().setBody(Buffer.from("sfa", "utf-8"))
  )
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.body = ctx.sfaCtx.req.body;
        ctx.status = 200;
        await next();
      })
    )
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual(Buffer.from("sfa", "utf-8"));
  expect(res.getHeader("content-type")).toBe("application/octet-stream");
});
