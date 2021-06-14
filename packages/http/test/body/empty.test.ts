import { SfaHttp } from "../../src";
import request = require("supertest");

test("empty body", async function () {
  const server = new SfaHttp()
    .use(async (ctx) => {
      ctx.ok(undefined);
    })
    .listen();
  const res = await request(server).get("").type("text");
  server.close();

  expect(res.status).toBe(200);
  expect(res.text).toEqual("");
});
