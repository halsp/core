import { HttpServerStartup } from "../src";
import request from "supertest";

test("end ahead", async () => {
  const server = new HttpServerStartup()
    .use(async (ctx, next) => {
      ctx.resStream.end();
      expect(!!ctx.reqStream).toBeTruthy();
      await next();
    })
    .use(async (ctx) => {
      ctx.ok("BODY");
    })
    .listen();
  const res = await request(server).get("");
  server.close();

  expect(res.status).toBe(404);
  expect(res.body).not.toBe("BODY");
});

test("writeHead", async () => {
  const server = new HttpServerStartup()
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
