import { SfaHttp } from "../../src";
import request from "supertest";

test("json body explicit type", async function () {
  const server = new SfaHttp()
    .use(async (ctx) => {
      ctx.res.setHeader("content-type", "application/json");
      ctx.res.setHeader(
        "content-length",
        Buffer.byteLength(
          JSON.stringify({
            content: "BODY",
          })
        ).toString()
      );
      ctx.ok({
        content: "BODY",
      });
    })
    .listen();
  const res = await request(server).get("").type("json");
  server.close();

  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toBe("application/json");
  expect(res.body).toEqual({
    content: "BODY",
  });
});
