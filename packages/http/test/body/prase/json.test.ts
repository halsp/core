import { SfaHttp } from "../../../src";
import request = require("supertest");

test("useHttpJsonBody", async function () {
  const server = new SfaHttp()
    .useHttpJsonBody()
    .use(async (ctx) => {
      ctx.ok(ctx.req.body);
    })
    .listen();
  const res = await request(server).post("").send({
    content: "BODY",
  });
  server.close();

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    content: "BODY",
  });
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
});

test("parse json error", async function () {
  const server = new SfaHttp()
    .useHttpJsonBody(
      undefined,
      undefined,
      undefined,
      undefined,
      async (ctx) => {
        ctx.badRequestMsg({ message: "ERROR" });
      }
    )
    .use(async (ctx) => {
      ctx.ok(ctx.req.body);
    })
    .listen();
  const res = await request(server).post("").send("+'{}").type("json");
  server.close();

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    message: "ERROR",
  });
});

test("parse json error default", async function () {
  const server = new SfaHttp()
    .use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        ctx.badRequestMsg({ message: (err as Error).message });
      }
    })
    .useHttpJsonBody()
    .use(async (ctx) => {
      ctx.ok(ctx.req.body);
    })
    .listen();
  const res = await request(server).post("").send("+'{}").type("json");
  server.close();

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    message: "invalid JSON, only supports object and array",
  });
});
