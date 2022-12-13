import "../src";
import { TestHttpStartup } from "@ipare/testing/dist/http";
import { Request } from "@ipare/core";

describe("request body", () => {
  it("should parse text body", async function () {
    const res = await new TestHttpStartup()
      .setContext(new Request().setBody("ipare"))
      .koa(async (ctx, next) => {
        ctx.body = ctx.ipareCtx.req.body;
        ctx.status = 200;
        await next();
      })
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toBe("ipare");
    expect(res.getHeader("content-type")).toBe("text/plain; charset=utf-8");
  });

  it("should parse json body", async function () {
    const res = await new TestHttpStartup()
      .setContext(
        new Request().setBody({
          ipare: "koa",
        })
      )
      .koa(async (ctx, next) => {
        ctx.body = ctx.ipareCtx.req.body;
        ctx.status = 200;
        await next();
      })
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ipare: "koa",
    });
    expect(res.getHeader("content-type")).toBe(
      "application/json; charset=utf-8"
    );
  });

  it("should parse buffer body", async function () {
    const res = await new TestHttpStartup()
      .setContext(new Request().setBody(Buffer.from("ipare", "utf-8")))
      .koa(async (ctx, next) => {
        ctx.body = ctx.ipareCtx.req.body;
        ctx.status = 200;
        await next();
      })
      .run();

    expect(res.status).toBe(200);
    expect(res.body).toEqual(Buffer.from("ipare", "utf-8"));
    expect(res.getHeader("content-type")).toBe("application/octet-stream");
  });
});
