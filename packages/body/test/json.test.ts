import request from "supertest";
import { TestBodyParserStartup } from "./utils";

test("useHttpJsonBody", async () => {
  let invoke = false;
  const server = new TestBodyParserStartup()
    .useHttpJsonBody()
    .use(async (ctx) => {
      expect(ctx.req.body).toEqual({
        content: "BODY",
      });
      invoke = true;
    })
    .listen();
  await request(server).post("").send({
    content: "BODY",
  });
  server.close();

  expect(invoke).toBeTruthy();
});

test("parse json error", async () => {
  let invoke = false;
  const server = new TestBodyParserStartup()
    .use(async (ctx, next) => {
      await next();
      expect(ctx.res.body).toEqual({
        message: "ERROR",
        status: 400,
      });
      expect(ctx.res.status).toBe(400);
      invoke = true;
    })
    .useHttpJsonBody(undefined, async (ctx) => {
      ctx.res.badRequestMsg({ message: "ERROR" });
    })
    .use(async (ctx) => {
      ctx.res.ok(ctx.req.body);
    })
    .listen();
  await request(server).post("").send("+'{}").type("json");
  server.close();
  expect(invoke).toBeTruthy();
});

test("parse json error default", async () => {
  let invoke = false;
  const server = new TestBodyParserStartup()
    .use(async (ctx, next) => {
      await next();
      expect(ctx.res.body).toEqual({
        message: "invalid JSON, only supports object and array",
        status: 400,
      });
      expect(ctx.res.status).toBe(400);
      invoke = true;
    })
    .useHttpJsonBody()
    .use((ctx) => {
      ctx.res.ok(ctx.req.body);
    })
    .listen();
  await request(server).post("").send("+'{}").type("json");
  server.close();
  expect(invoke).toBeTruthy();
});
