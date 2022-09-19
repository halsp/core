import { ServerStartup } from "../../../src";
import request from "supertest";

test("useHttpTextBody", async () => {
  const server = new ServerStartup()
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

test("error type", async () => {
  const server = new ServerStartup()
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
