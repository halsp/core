import "../src";
import { TestHttpStartup } from "@halsp/testing/dist/http";

test("default", async function () {
  const res = await new TestHttpStartup().koa(() => undefined).run();

  expect(res.status).toBe(404);
  expect(res.body).toBeUndefined();
  expect(res.getHeader("content-type")).toBeUndefined();
});

test("text", async function () {
  const res = await new TestHttpStartup()
    .koa(async (ctx, next) => {
      ctx.body = "halsp";
      ctx.status = 201;
      await next();
    })
    .run();

  expect(res.status).toBe(201);
  expect(res.body).toBe("halsp");
  expect(res.getHeader("content-type")).toBe("text/plain; charset=utf-8");
});

test("boolean", async function () {
  const res = await new TestHttpStartup()
    .koa(async (ctx, next) => {
      ctx.body = true;
      ctx.status = 201;
      await next();
    })
    .run();

  expect(res.status).toBe(201);
  expect(res.body).toBe(true);
  expect(res.getHeader("content-type")).toBe("application/json; charset=utf-8");
});

test("json", async function () {
  const res = await new TestHttpStartup()
    .koa(async (ctx, next) => {
      ctx.body = {
        halsp: "koa",
      };
      ctx.status = 200;
      await next();
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    halsp: "koa",
  });
  expect(res.getHeader("content-type")).toBe("application/json; charset=utf-8");
});

test("buffer", async function () {
  const res = await new TestHttpStartup()
    .koa(async (ctx, next) => {
      ctx.body = Buffer.from("halsp", "utf-8");
      ctx.status = 200;
      await next();
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual(Buffer.from("halsp", "utf-8"));
  expect(res.getHeader("content-type")).toBe("application/octet-stream");
});
