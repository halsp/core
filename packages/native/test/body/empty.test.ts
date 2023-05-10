import "../../src";
import request from "supertest";
import { Startup } from "@halsp/core";

test("empty body", async () => {
  const server = await new Startup()
    .useNative()
    .use(async (ctx) => {
      ctx.res.ok(undefined);
    })
    .listen();
  const res = await request(server).get("").type("text");
  server.close();

  expect(res.status).toBe(200);
  expect(res.text).toEqual("");
});
