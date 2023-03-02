import "../src";
import { HttpMethods } from "@halsp/methods";
import { Request, Response } from "@halsp/common";
import cors from "@koa/cors";
import Router from "@koa/router";
import { TestHttpStartup } from "@halsp/testing/dist/http";

test("@koa/cors", async function () {
  const res = await new TestHttpStartup()
    .setContext(
      new Request()
        .setMethod(HttpMethods.get)
        .set("origin", "https://halsp.org")
    )
    .koa(
      cors({
        allowMethods: "GET,POST",
      })
    )
    .use(async (ctx) => {
      ctx.res.ok("halsp");
    })
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toBe("halsp");
  expect(res.getHeader("Access-Control-Allow-Origin")).toBe(
    "https://halsp.org"
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
    return await new TestHttpStartup()
      .setContext(new Request().setMethod(method).setPath(path))
      .use(async (ctx, next) => {
        await next();
      })
      .koa(router.routes())
      .koa(router.allowedMethods())
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
