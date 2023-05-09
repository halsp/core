import "../src";
import request from "supertest";
import { Startup } from "@halsp/core";

describe("startup", () => {
  it("should listen with empty options", async () => {
    const startup = new Startup().useNative({});
    const { server } = await startup
      .use(async (ctx) => {
        ctx.res.ok({
          content: "BODY",
        });
      })
      .dynamicListen();
    const res = await request(server).get("");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.body).toEqual({
      content: "BODY",
    });
    await startup.close();
  });

  it("should listen with https", async () => {
    const server = new Startup()
      .useNative({
        https: {},
      })
      .listen();
    expect(server).not.toBeUndefined();
    expect(server.listening).toBeTruthy();
    server.close();
  });
});

describe("write end", () => {
  test("should not send body after stream ended", async () => {
    const server = new Startup()
      .useNative()
      .useNative()
      .use(async (ctx, next) => {
        ctx.resStream.end();
        expect(!!ctx.reqStream).toBeTruthy();
        await next();
      })
      .use(async (ctx) => {
        ctx.res.ok("BODY");
      })
      .listen();
    const res = await request(server).get("");
    server.close();

    expect(res.status).toBe(404);
    expect(res.body).not.toBe("BODY");
  });

  test("should not set header after writeHead called", async () => {
    const server = new Startup()
      .useNative()
      .use(async (ctx, next) => {
        ctx.resStream.writeHead(200);
        await next();
      })
      .use(async (ctx) => {
        ctx.res.setHeader("h1", "1");
      })
      .listen();
    const res = await request(server).get("");
    server.close();

    expect(res.status).toBe(200);
    expect(res.headers.h1).toBeUndefined();
  });
});
