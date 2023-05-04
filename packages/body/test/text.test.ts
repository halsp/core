import { Startup } from "@halsp/core";
import request from "supertest";
import "./utils";

test("useHttpTextBody", async () => {
  let invoke = false;
  const server = new Startup()
    .use(async (ctx, next) => {
      await next();
      expect(ctx.res.body).toBe("a piece of text");
      invoke = true;
    })
    .useHttpTextBody()
    .use(async (ctx) => {
      ctx.res.ok(ctx.req.body);
    })
    .listenTest();
  await request(server).post("").type("text").send("a piece of text");
  server.close();
  expect(invoke).toBeTruthy();
});

test("error type", async () => {
  let invoke = false;
  const server = new Startup()
    .use(async (ctx, next) => {
      await next();
      expect(ctx.res.body).toEqual({
        exist: false,
      });
      invoke = true;
    })
    .useHttpTextBody()
    .use(async (ctx) => {
      ctx.res.ok({
        exist: !!ctx.req.body,
      });
    })
    .listenTest();
  await request(server).post("").type("json").send({});
  server.close();
  expect(invoke).toBeTruthy();
});
