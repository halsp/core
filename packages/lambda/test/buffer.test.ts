import { Stream } from "stream";
import SfaCloudbase from "../src";

test("buffer", async function () {
  const res = await new SfaCloudbase()
    .use(async (ctx, next) => {
      ctx.ok(ctx.req.body);
      await next();
    })
    .run(
      {
        body: Buffer.from("test", "utf-8").toString("base64"),
        isBase64Encoded: true,
      },
      {}
    );

  expect(res.body).toBe(Buffer.from("test", "utf-8").toString("base64"));
  expect(res.headers["content-type"]).toBe("application/octet-stream");
});

test("set buffer type", async function () {
  const res = await new SfaCloudbase()
    .use(async (ctx, next) => {
      ctx
        .ok(ctx.req.body)
        .setHeader("content-type", "stream")
        .setHeader("content-length", 100);
      await next();
    })
    .run(
      {
        body: Buffer.from("test", "utf-8").toString("base64"),
        isBase64Encoded: true,
      },
      {}
    );

  expect(res.body).toBe(Buffer.from("test", "utf-8").toString("base64"));
  expect(res.headers["content-type"]).toBe("stream");
  expect(res.headers["content-length"]).toBe("100");
});

test("stream", async function () {
  let error: Error | undefined;
  try {
    await new SfaCloudbase()
      .use(async (ctx, next) => {
        await next();
      })
      .use(async (ctx, next) => {
        ctx.ok(new Stream());
        await next();
      })
      .run({}, {});
  } catch (err) {
    error = err;
  }
  expect(!!error).toBeTruthy();
});
