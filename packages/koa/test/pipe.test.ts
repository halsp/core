import "../src";
import { TestHttpStartup } from "@ipare/testing";
import { TransResponse } from "../src/trans-response";

test("middleware pipe", async function () {
  const res = await new TestHttpStartup()
    .use(async (ctx, next) => {
      ctx.res.status = 201;
      await next();
    })
    .koa(async (ctx, next) => {
      ctx.body = "ipare";
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
    .run();

  expect(res.body).toBe("ipareaaa");
  expect(res.getHeader("h")).toBe("hhhh");
  expect(res.status).toBe(201);
});

test("koa break", async function () {
  const res = await new TestHttpStartup()
    .use(async (ctx, next) => {
      await next();
    })
    .koa(async (ctx) => {
      ctx.body = "ipare";
      ctx.status = 201;
      ctx.set("h", "h");
    })
    .use(async (ctx, next) => {
      ctx.res.body += "a";
      ctx.res.status = 200;
      await next();
    })
    .run();

  expect(res.body).toBe("ipare");
  expect(res.getHeader("h")).toBe("h");
  expect(res.status).toBe(201);
});
