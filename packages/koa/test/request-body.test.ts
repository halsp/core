import "../src";
import "@halsp/testing";
import { Request, Startup } from "@halsp/core";

describe("request body", () => {
  it("should parse text body", async function () {
    const res = await new Startup()
      .setContext(new Request().setBody("halsp"))
      .koa(async (ctx, next) => {
        ctx.body = ctx.halspCtx.req.body;
        ctx.status = 200;
        await next();
      })
      .test();

    expect(res.status).toBe(200);
    expect(res.body).toBe("halsp");
    expect(res.getHeader("content-type")).toBe("text/plain; charset=utf-8");
  });

  it("should parse json body", async function () {
    const res = await new Startup()
      .setContext(
        new Request().setBody({
          halsp: "koa",
        }),
      )
      .koa(async (ctx, next) => {
        ctx.body = ctx.halspCtx.req.body;
        ctx.status = 200;
        await next();
      })
      .test();

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      halsp: "koa",
    });
    expect(res.getHeader("content-type")).toBe(
      "application/json; charset=utf-8",
    );
  });

  it("should parse buffer body", async function () {
    const res = await new Startup()
      .setContext(new Request().setBody(Buffer.from("halsp", "utf-8")))
      .koa(async (ctx, next) => {
        ctx.body = ctx.halspCtx.req.body;
        ctx.status = 200;
        await next();
      })
      .test();

    expect(res.status).toBe(200);
    expect(res.body).toEqual(Buffer.from("halsp", "utf-8"));
    expect(res.getHeader("content-type")).toBe("application/octet-stream");
  });
});
