import "../src";
import Koa from "koa";
import request from "supertest";
import { SfaHttp } from "@sfajs/http";

test("streamingBody", async function () {
  let working = false;
  const server = new SfaHttp()
    .use(async (ctx, next) => {
      await next();

      const res = ctx.res;

      expect(res.status).toBe(200);
      expect(
        (res.body as Buffer)
          .toString("utf-8")
          .startsWith("--------------------")
      ).toBeTruthy();
      expect(res.getHeader("content-type")).toBe("application/octet-stream");
      working = true;
    })
    .useKoa(
      new Koa().use(async (ctx, next) => {
        ctx.body = ctx.req.read(100);
        ctx.status = 200;
        await next();
      }),
      {
        streamingBody: (ctx) => ctx.httpReq,
      }
    )
    .listen();

  try {
    await request(server)
      .post("")
      .field("name", "fileName")
      .attach("file", "./LICENSE");
  } catch (err) {
    // node 16.x bug
  } finally {
    server.close();
  }

  expect(working).toBeTruthy();
});
