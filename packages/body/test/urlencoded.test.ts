import { Startup } from "@halsp/core";
import request from "supertest";
import "./utils";

test("useHttpUrlencodedBody", async () => {
  let invoke = false;
  const server = new Startup()
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
      ctx.res.ok({
        body: ctx.req.body,
        type: ctx.req.getHeader("content-type"),
      });
    })
    .listenTest();
  await request(server).post("").type("urlencoded").send("name=hal");
  server.close();
  expect(invoke).toBeTruthy();
});
