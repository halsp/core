import { SfaHttp } from "../../src";
import request = require("supertest");

test("text body", async function () {
  const server = new SfaHttp()
    .use(async (ctx) => {
      ctx.ok("BODY");
    })
    .listen();
  const res = await request(server).get("").type("text");
  server.close();

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toBe("text/plain; charset=utf-8");
  expect(res.text).toBe("BODY");
});

test("text body explicit type", async function () {
  const server = new SfaHttp()
    .use(async (ctx) => {
      ctx.res.setHeader("content-type", "text/plain");
      ctx.res.setHeader("content-length", Buffer.byteLength("BODY").toString());
      ctx.ok("BODY");
    })
    .listen();
  const res = await request(server).get("").type("text");
  server.close();

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toBe("text/plain");
  expect(res.text).toBe("BODY");
});

test("html body", async function () {
  const server = new SfaHttp()
    .use(async (ctx) => {
      ctx.ok("<div>BODY</div>");
    })
    .listen();
  const res = await request(server).get("").type("text");
  server.close();

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toBe("text/html; charset=utf-8");
  expect(res.text).toBe("<div>BODY</div>");
});
