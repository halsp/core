import { SfaHttp } from "../../src";
import request from "supertest";
import { createReadStream } from "fs";

test("stream body", async function () {
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

test("stream body explicit type", async function () {
  const server = new SfaHttp()
    .use(async (ctx) => {
      ctx.res.setHeader("content-type", "application/octet-stream");
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
