import "../src";
import { TestStartup } from "@sfajs/core";
import * as Koa from "koa";
import TransResponse from "../src/TransResponse";

test("middleware pipe", async function () {
  const res = await new TestStartup()
    .use(async (ctx, next) => {
      ctx.res.status = 201;
      await next();
    })
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.body = "sfa";
        ctx.set("h", "h");
        await next();
      })
    )
    .use(async (ctx, next) => {
      ctx.res.body += "a";
      ctx.res.setHeader("h", ctx.res.getHeader("h") + "h");
      await next();
    })
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.body += "a";
        ctx.set("h", ctx.res.getHeader("h") + "h");
        expect(ctx.response.headers).toEqual(
          (ctx.res as TransResponse).headers
        );
        await next();
      })
    )
    .use(async (ctx, next) => {
      ctx.res.body += "a";
      ctx.res.setHeader("h", ctx.res.getHeader("h") + "h");
      await next();
    })
    .run();

  expect(res.body).toBe("sfaaaa");
  expect(res.getHeader("h")).toBe("hhhh");
  expect(res.status).toBe(201);
});

test("koa break", async function () {
  const res = await new TestStartup()
    .use(async (ctx, next) => {
      await next();
    })
    .useKoa(
      new Koa().use(async (ctx) => {
        ctx.body = "sfa";
        ctx.status = 201;
        ctx.set("h", "h");
      })
    )
    .use(async (ctx, next) => {
      ctx.res.body += "a";
      ctx.res.status = 200;
      await next();
    })
    .run();

  expect(res.body).toBe("sfa");
  expect(res.getHeader("h")).toBe("h");
  expect(res.status).toBe(201);
});
