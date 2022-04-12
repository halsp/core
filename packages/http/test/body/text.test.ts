import { SfaHttp } from "../../src";
import * as request from "supertest";

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

function runTextReturn(headersSent: boolean) {
  test(`return text headersSent: ${headersSent}`, async function () {
    const server = new SfaHttp()
      .use(async (ctx) => {
        if (headersSent) {
          ctx.httpRes.flushHeaders();
        }
        ctx.ok("BODY");
      })
      .listen();
    const res = await request(server).get("").responseType("text/plain");
    server.close();

    if (headersSent) {
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toBeUndefined();
      expect(res.headers["content-length"]).toBeUndefined();
    } else {
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toBe("text/plain; charset=utf-8");
      expect(res.headers["content-length"]).toBe(
        Buffer.byteLength("BODY").toString()
      );
    }
    expect(res.body).toEqual(Buffer.from("BODY", "utf-8"));
  });
}

runTextReturn(true);
runTextReturn(false);
