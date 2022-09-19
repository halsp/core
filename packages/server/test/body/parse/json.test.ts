import { ServerStartup } from "../../../src";
import request from "supertest";

test("useHttpJsonBody", async () => {
  const server = new ServerStartup()
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

test("parse json error", async () => {
  const server = new ServerStartup()
    .useHttpJsonBody(undefined, async (ctx) => {
      ctx.badRequestMsg({ message: "ERROR" });
    })
    .use(async (ctx) => {
      ctx.ok(ctx.req.body);
    })
    .listen();
  const res = await request(server).post("").send("+'{}").type("json");
  server.close();

  expect(res.status).toBe(400);
  expect(res.body).toEqual({
    message: "ERROR",
    status: 400,
  });
});

test("parse json error default", async () => {
  const server = new ServerStartup()
    .useHttpJsonBody()
    .use((ctx) => {
      ctx.ok(ctx.req.body);
    })
    .listen();
  const res = await request(server).post("").send("+'{}").type("json");
  server.close();

  expect(res.status).toBe(500);
  expect(res.body).toEqual({
    message: "invalid JSON, only supports object and array",
    status: 500,
  });
});
