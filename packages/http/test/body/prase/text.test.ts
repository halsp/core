import { SfaHttp } from "../../../src";
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

test("useHttpTextBody", async function () {
  const server = new SfaHttp()
    .useHttpTextBody()
    .use(async (ctx) => {
      ctx.ok(ctx.req.body);
    })
    .listen();
  const res = await request(server)
    .post("")
    .type("text")
    .send("a piece of text");
  server.close();

  expect(res.text).toBe("a piece of text");
  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toBe("text/plain; charset=utf-8");
});

test("error type", async function () {
  const server = new SfaHttp()
    .useHttpTextBody()
    .use(async (ctx) => {
      ctx.ok({
        exist: !!ctx.req.body,
      });
    })
    .listen();
  const res = await request(server).post("").type("json").send({});
  server.close();

  expect(res.status).toBe(200);
  expect(res.body.exist).toBeFalsy();
});
