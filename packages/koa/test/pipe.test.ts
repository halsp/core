import "../src";
import { TestStartup } from "sfa";
import * as Koa from "koa";
import TransResponse from "../src/TransResponse";

test("without type", async function () {
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
