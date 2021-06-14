import { SfaHttp } from "../../src";
import request = require("supertest");
import { createReadStream } from "fs";

test("text body", async function () {
  const server = new SfaHttp()
    .use(async (ctx) => {
      ctx.ok(createReadStream("./LICENSE"));
    })
    .listen();
  const res = await request(server).get("");
  server.close();

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toBe("application/octet-stream");
  const buffer = res.body as Buffer;
  expect(buffer.toString().startsWith("MIT License")).toBeTruthy();
});
