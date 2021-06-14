import { SfaHttp } from "../../src";
import request = require("supertest");

test("text body", async function () {
  const server = new SfaHttp()
    .use(async (ctx) => {
      ctx.ok(Buffer.from("BODY", "utf-8"));
    })
    .listen();
  const res = await request(server).get("");
  server.close();

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toBe("application/octet-stream");
  expect(res.body).toEqual(Buffer.from("BODY", "utf-8"));
});
