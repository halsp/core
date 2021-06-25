import "../src";
import { TestStartup, Request } from "sfa";
import * as Koa from "koa";

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
        ctx.body = "sfa";
        ctx.status = 201;
        await next();
      })
    )
    .run();

  expect(res.status).toBe(201);
  expect(res.body).toBe("sfa");
  expect(res.getHeader("content-type")).toBe("text/plain; charset=utf-8");
});

test("json", async function () {
  const koaApp = new Koa().use(async (ctx, next) => {
    ctx.body = {
      sfa: "koa",
    };
    ctx.status = 200;
    await next();
  });
  koaApp.on("error", () => void 0);
  const res = await new TestStartup().useKoa(koaApp).run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    sfa: "koa",
  });
  expect(res.getHeader("content-type")).toBe("application/json; charset=utf-8");
});

test("buffer", async function () {
  const res = await new TestStartup()
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.body = Buffer.from("sfa", "utf-8");
        ctx.status = 200;
        await next();
      })
    )
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual(Buffer.from("sfa", "utf-8"));
  expect(res.getHeader("content-type")).toBe("application/octet-stream");
});
