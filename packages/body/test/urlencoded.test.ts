import request from "supertest";
import { TestBodyParserStartup } from "./utils";

test("useHttpUrlencodedBody", async () => {
  let invoke = false;
  const server = new TestBodyParserStartup()
    .use(async (ctx, next) => {
      await next();

      expect(ctx.res.body).toEqual({
        body: { name: "hal" },
        type: "application/x-www-form-urlencoded",
      });
      invoke = true;
    })
    .useHttpUrlencodedBody()
    .use(async (ctx) => {
      ctx.ok({
        body: ctx.req.body,
        type: ctx.req.getHeader("content-type"),
      });
    })
    .listen();
  await request(server).post("").type("urlencoded").send("name=hal");
  server.close();
  expect(invoke).toBeTruthy();
});
