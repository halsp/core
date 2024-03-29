import "../src";
import { HttpMethods } from "@halsp/http";
import { Request, Response, Startup } from "@halsp/core";
import cors from "@koa/cors";
import Router from "@koa/router";
import "@halsp/testing";

test("@koa/cors", async function () {
  const res = await new Startup()
    .setContext(
      new Request()
        .setMethod(HttpMethods.get)
        .set("origin", "https://halsp.org"),
    )
    .koa(
      cors({
        allowMethods: "GET,POST",
        origin(ctx) {
          return ctx.get("Origin") || "*";
        },
      }),
    )
    .use(async (ctx) => {
      ctx.res.ok("halsp");
    })
    .test();

  expect(res.status).toBe(200);
  expect(res.body).toBe("halsp");
  expect(res.getHeader("Access-Control-Allow-Origin")).toBe(
    "https://halsp.org",
  );
});

test("@koa/router", async function () {
  const router = new Router()
    .get("/", async (ctx) => {
      ctx.body = "default";
      ctx.status = 200;
    })
    .post("/user", async (ctx) => {
      ctx.body = "user";
      ctx.status = 200;
      ctx.set("account", "hi@hal.wang");
    });

  async function request(method: string, path: string): Promise<Response> {
    return await new Startup()
      .setContext(new Request().setMethod(method).setPath(path))
      .use(async (ctx, next) => {
        await next();
      })
      .koa(router.routes())
      .koa(router.allowedMethods())
      .test();
  }

  {
    const res = await request("GET", "/");

    expect(res.status).toBe(200);
    expect(res.body).toBe("default");
  }

  {
    const res = await request("POST", "/user");

    expect(res.getHeader("account")).toBe("hi@hal.wang");
    expect(res.body).toBe("user");
    expect(res.status).toBe(200);
  }
});
