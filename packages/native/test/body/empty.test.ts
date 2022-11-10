import { NativeStartup } from "../../src";
import request from "supertest";

test("empty body", async () => {
  const server = new NativeStartup()
    .use(async (ctx) => {
      ctx.ok(undefined);
    })
    .listen();
  const res = await request(server).get("").type("text");
  server.close();

  expect(res.status).toBe(200);
  expect(res.text).toEqual("");
});
