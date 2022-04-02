import "../src";
import { TestStartup, SfaRequest, SfaResponse } from "@sfajs/core";
import Koa from "koa";
import cors from "koa-cors";
import Router from "@koa/router";

test("koa-cors", async function () {
  const res = await new TestStartup(new SfaRequest().setMethod("POST"))
    .useKoa(
      new Koa().use(
        cors({
          methods: "GET,POST",
          origin: "http://localhost",
        })
      )
    )
    .use(async (ctx) => {
      ctx.ok("sfa");
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("sfa");
  expect(res.getHeader("Access-Control-Allow-Methods")).toBe("GET,POST");
  expect(res.getHeader("Access-Control-Allow-Origin")).toBe("http://localhost");
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

  async function request(method: string, path: string): Promise<SfaResponse> {
    return await new TestStartup(
      new SfaRequest().setMethod(method).setPath(path)
    )
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
