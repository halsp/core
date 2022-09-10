import "../src";
import { TestStartup } from "@ipare/testing";
import { Request } from "@ipare/core";

describe("request body", () => {
  it("should parse text body", async function () {
    const res = await new TestStartup()
      .setRequest(new Request().setBody("ipare"))
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
    const res = await new TestStartup()
      .setRequest(
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
    const res = await new TestStartup()
      .setRequest(new Request().setBody(Buffer.from("ipare", "utf-8")))
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

  it("should parse aliReq", async function () {
    let working = 0;
    await new TestStartup()
      .use(async (ctx, next) => {
        ctx["aliReq"] = { a: 1 };
        await next();
      })
      .koa(async (ctx, next) => {
        expect(ctx.req["a"]).toBe(1);
        working++;
        await next();
      })
      .run();

    expect(working).toBe(1);
  });
});
