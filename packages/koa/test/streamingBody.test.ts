import "../src";
import { TestStartup, SfaRequest, SfaResponse } from "sfa";
import * as Koa from "koa";
import * as http from "http";
import request = require("supertest");

test("streamingBody", async function () {
  let res: SfaResponse | undefined;
  const server = http.createServer(async (httpRes, httpReq) => {
    res = await new TestStartup(
      new SfaRequest().setHeader("h1", 1).setHeader("h2", "2")
    )
      .useKoa(
        new Koa().use(async (ctx, next) => {
          ctx.body = ctx.req.read(100);
          ctx.status = 200;
          ctx.set("h1", ctx.req.headers.h1 as string);
          ctx.set("h2", ctx.req.headers.h2 as string);
          await next();
        }),
        {
          streamingBody: () => httpRes,
        }
      )
      .run();
    httpReq.end();
  });
  await request(server)
    .post("")
    .field("name", "fileName")
    .attach("file", "./LICENSE");
  server.close();
  if (!res) {
    expect(!!res).toBeTruthy();
    return;
  }

  expect(res.status).toBe(200);
  expect(
    (res.body as Buffer).toString("utf-8").startsWith("--------------------")
  ).toBeTruthy();
  expect(res.getHeader("content-type")).toBe("application/octet-stream");
  expect(res.headers["h1"]).toBe("1");
  expect(res.headers["h2"]).toBe("2");
});
