import "../../src";
import request from "supertest";
import { Startup } from "@halsp/core";

test("buffer body explicit type", async () => {
  const server = await new Startup()
    .useNative({
      port: 0,
    })
    .use(async (ctx) => {
      ctx.res.setHeader("content-type", "application/octet-stream");
      ctx.res.setHeader("content-length", Buffer.byteLength("BODY").toString());
      ctx.res.ok(Buffer.from("BODY", "utf-8"));
    })
    .listen();
  const res = await request(server).get("");
  server.close();

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toBe("application/octet-stream");
  expect(res.body).toEqual(Buffer.from("BODY", "utf-8"));
});

test("buffer body", async () => {
  const server = await new Startup()
    .useNative({
      port: 0,
    })
    .use(async (ctx) => {
      ctx.res.ok(Buffer.from("BODY", "utf-8"));
    })
    .listen();
  const res = await request(server).get("");
  server.close();

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toBe("application/octet-stream");
  expect(res.body).toEqual(Buffer.from("BODY", "utf-8"));
});
