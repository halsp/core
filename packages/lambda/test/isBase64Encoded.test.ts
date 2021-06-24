import SfaCloudbase from "../src";

test("html", async function () {
  const res = await new SfaCloudbase(
    {
      body: Buffer.from("test", "utf-8").toString("base64"),
      isBase64Encoded: true,
    },
    {}
  )
    .use(async (ctx, next) => {
      ctx.ok(ctx.req.body);
      await next();
    })
    .run();

  expect(res.body instanceof Buffer).toBeTruthy();
});
