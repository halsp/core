import "../src";
import "@halsp/testing";
import { Startup } from "@halsp/core";

test("writeHead", async function () {
  const res = await new Startup()
    .koa(async (ctx, next) => {
      ctx.res.writeHead(200);
      await next();
    })
    .test();

  expect(res.status).toBe(200);
  expect(res.body).toBeUndefined();
});

test("writeHead2", async function () {
  const res = await new Startup()
    .koa(async (ctx, next) => {
      ctx.res.writeHead(200, "", {
        h1: 1,
      });
      await next();
    })
    .test();

  expect(res.status).toBe(200);
  expect(res.getHeader("h1")).toBe("1");
});

test("removeHeader", async function () {
  const res = await new Startup()
    .koa(async (ctx, next) => {
      ctx.res.setHeader("h1", 1);
      ctx.res.writeHead(200, "", {
        h2: 2,
      });
      ctx.res.removeHeader("h1");
      await next();
    })
    .use(async (ctx) => {
      ctx.res.setHeader("h3", "");
    })
    .test();

  expect(res.status).toBe(200);
  expect(res.getHeader("h1")).toBeUndefined();
  expect(res.getHeader("h2")).toBe("2");
  expect(res.getHeader("h3")).toBeUndefined();
});
