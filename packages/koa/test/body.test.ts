import "../src";
import { TestStartup } from "@ipare/core";
import Koa from "koa";

test("default", async function () {
  const res = await new TestStartup().useKoa(new Koa()).run();

  expect(res.status).toBe(404);
  expect(res.body).toBeUndefined();
  expect(res.getHeader("content-type")).toBeUndefined();
});

test("text", async function () {
  const res = await new TestStartup()
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.body = "ipare";
        ctx.status = 201;
        await next();
      })
    )
    .run();

  expect(res.status).toBe(201);
  expect(res.body).toBe("ipare");
  expect(res.getHeader("content-type")).toBe("text/plain; charset=utf-8");
});

test("json", async function () {
  const koaApp = new Koa().use(async (ctx, next) => {
    ctx.body = {
      ipare: "koa",
    };
    ctx.status = 200;
    await next();
  });
  koaApp.on("error", () => void 0);
  const res = await new TestStartup().useKoa(koaApp).run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    ipare: "koa",
  });
  expect(res.getHeader("content-type")).toBe("application/json; charset=utf-8");
});

test("buffer", async function () {
  const res = await new TestStartup()
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.body = Buffer.from("ipare", "utf-8");
        ctx.status = 200;
        await next();
      })
    )
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual(Buffer.from("ipare", "utf-8"));
  expect(res.getHeader("content-type")).toBe("application/octet-stream");
});
