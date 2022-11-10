import request from "supertest";
import { TestBodyParserStartup } from "./utils";

test("useHttpTextBody", async () => {
  let invoke = false;
  const server = new TestBodyParserStartup()
    .use(async (ctx, next) => {
      await next();
      expect(ctx.res.body).toBe("a piece of text");
      invoke = true;
    })
    .useHttpTextBody()
    .use(async (ctx) => {
      ctx.ok(ctx.req.body);
    })
    .listen();
  await request(server).post("").type("text").send("a piece of text");
  server.close();
  expect(invoke).toBeTruthy();
});

test("error type", async () => {
  let invoke = false;
  const server = new TestBodyParserStartup()
    .use(async (ctx, next) => {
      await next();
      expect(ctx.res.body).toEqual({
        exist: false,
      });
      invoke = true;
    })
    .useHttpTextBody()
    .use(async (ctx) => {
      ctx.ok({
        exist: !!ctx.req.body,
      });
    })
    .listen();
  await request(server).post("").type("json").send({});
  server.close();
  expect(invoke).toBeTruthy();
});
