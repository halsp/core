import "../src";
import { TestStartup, SfaRequest, SfaResponse } from "@sfajs/core";
import Koa from "koa";
import request from "supertest";
import path from "path";
import http from "http";

test("streamingBody", async function () {
  let working = false;
  let res: SfaResponse | undefined;
  const server = http.createServer(async (httpReq, httpRes) => {
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
          streamingBody: () => httpReq,
        }
      )
      .run();
    httpRes.end();

    expect(!!res).toBeTruthy();
    if (!res) return;

    expect(res.status).toBe(200);
    expect(
      (res.body as Buffer).toString("utf-8").startsWith("--------------------")
    ).toBeTruthy();
    expect(res.getHeader("content-type")).toBe("application/octet-stream");
    expect(res.headers["h1"]).toBe("1");
    expect(res.headers["h2"]).toBe("2");

    working = true;
  });

  try {
    await request(server)
      .put("")
      .field("name", "fileName")
      .attach("file", path.join(process.cwd(), "LICENSE"));
  } catch (err) {
    console.log("err", err);
  } finally {
    expect(working).toBeTruthy();
  }
});
