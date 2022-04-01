import { SfaCloudbase } from "../src";

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
