import "../src";
import { HttpMethod, Request, Response } from "@ipare/core";
import Koa from "koa";
import cors from "@koa/cors";
import Router from "@koa/router";
import { TestStartup } from "@ipare/testing";

test("@koa/cors", async function () {
  const res = await new TestStartup()
    .setRequest(
      new Request().setMethod(HttpMethod.get).set("origin", "https://ipare.org")
    )
    .useKoa(
      new Koa().use(
        cors({
          allowMethods: "GET,POST",
        })
      )
    )
    .use(async (ctx) => {
      ctx.ok("ipare");
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("ipare");
  expect(res.getHeader("Access-Control-Allow-Origin")).toBe(
    "https://ipare.org"
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
    return await new TestStartup()
      .setRequest(new Request().setMethod(method).setPath(path))
      .use(async (ctx, next) => {
        await next();
      })
      .useKoa(
        new Koa()
          .use(router.routes() as Koa.Middleware)
          .use(router.allowedMethods() as Koa.Middleware)
      )
      .run();
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
