import { SfaHttp } from "../../../src";
import request from "supertest";

test("useHttpUrlencodedBody", async () => {
  const server = new SfaHttp()
    .useHttpUrlencodedBody()
    .use(async (ctx) => {
      ctx.ok({
        body: ctx.req.body,
        type: ctx.req.getHeader("content-type"),
      });
    })
    .listen();
  const res = await request(server)
    .post("")
    .type("urlencoded")
    .send("name=hal");
  server.close();

  expect(res.body).toEqual({
    body: { name: "hal" },
    type: "application/x-www-form-urlencoded",
  });
  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
});
