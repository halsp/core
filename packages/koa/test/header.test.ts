import "../src";
import { TestStartup } from "@sfajs/core";
import Koa from "koa";

test("writeHead", async function () {
  const res = await new TestStartup()
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.res.writeHead(200);
        await next();
      })
    )
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBeUndefined();
});

test("writeHead2", async function () {
  const res = await new TestStartup()
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.res.writeHead(200, "", {
          h1: 1,
        });
        await next();
      })
    )
    .run();

  expect(res.status).toBe(200);
  expect(res.getHeader("h1")).toBe("1");
});

test("removeHeader", async function () {
  const res = await new TestStartup()
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.res.setHeader("h1", 1);
        ctx.res.writeHead(200, "", {
          h2: 2,
        });
        ctx.res.removeHeader("h1");
        await next();
      })
    )
    .use(async (ctx) => {
      ctx.res.setHeader("h3", "");
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.getHeader("h1")).toBeUndefined();
  expect(res.getHeader("h2")).toBe("2");
  expect(res.getHeader("h3")).toBeUndefined();
});
