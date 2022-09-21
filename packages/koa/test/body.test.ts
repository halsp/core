import "../src";
import { TestHttpStartup } from "@ipare/testing";

test("default", async function () {
  const res = await new TestHttpStartup().koa(() => undefined).run();

  expect(res.status).toBe(404);
  expect(res.body).toBeUndefined();
  expect(res.getHeader("content-type")).toBeUndefined();
});

test("text", async function () {
  const res = await new TestHttpStartup()
    .koa(async (ctx, next) => {
      ctx.body = "ipare";
      ctx.status = 201;
      await next();
    })
    .run();

  expect(res.status).toBe(201);
  expect(res.body).toBe("ipare");
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
        ipare: "koa",
      };
      ctx.status = 200;
      await next();
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    ipare: "koa",
  });
  expect(res.getHeader("content-type")).toBe("application/json; charset=utf-8");
});

test("buffer", async function () {
  const res = await new TestHttpStartup()
    .koa(async (ctx, next) => {
      ctx.body = Buffer.from("ipare", "utf-8");
      ctx.status = 200;
      await next();
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual(Buffer.from("ipare", "utf-8"));
  expect(res.getHeader("content-type")).toBe("application/octet-stream");
});
