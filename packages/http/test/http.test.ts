import { SfaHttp } from "../src";
import request from "supertest";

test("http", async function () {
  const server = new SfaHttp()
    .use(async (ctx) => {
      ctx.ok({
        content: "BODY",
      });
    })
    .listen();
  const res = await request(server).get("");

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
  expect(res.body).toEqual({
    content: "BODY",
  });
  server.close();
});
