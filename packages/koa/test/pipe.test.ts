import "../src";
import "@halsp/testing";
import { TransResponse } from "../src/trans-response";
import { Startup } from "@halsp/core";

test("middleware pipe", async function () {
  const res = await new Startup()
    .use(async (ctx, next) => {
      ctx.res.status = 201;
      await next();
    })
    .koa(async (ctx, next) => {
      ctx.body = "halsp";
      ctx.set("h", "h");
      await next();
    })
    .use(async (ctx, next) => {
      ctx.res.body += "a";
      ctx.res.setHeader("h", ctx.res.getHeader("h") + "h");
      await next();
    })
    .koa(async (ctx, next) => {
      ctx.body += "a";
      ctx.set("h", ctx.res.getHeader("h") + "h");
      expect(ctx.response.headers).toEqual((ctx.res as TransResponse).headers);
      await next();
    })
    .use(async (ctx, next) => {
      ctx.res.body += "a";
      ctx.res.setHeader("h", ctx.res.getHeader("h") + "h");
      await next();
    })
    .test();

  expect(res.body).toBe("halspaaa");
  expect(res.getHeader("h")).toBe("hhhh");
  expect(res.status).toBe(201);
});

test("koa break", async function () {
  const res = await new Startup()
    .use(async (ctx, next) => {
      await next();
    })
    .koa(async (ctx) => {
      ctx.body = "halsp";
      ctx.status = 201;
      ctx.set("h", "h");
    })
    .use(async (ctx, next) => {
      ctx.res.body += "a";
      ctx.res.status = 200;
      await next();
    })
    .test();

  expect(res.body).toBe("halsp");
  expect(res.getHeader("h")).toBe("h");
  expect(res.status).toBe(201);
});
