import { SfaCloudbase } from "../src";

test("query", async () => {
  const res = await new SfaCloudbase()
    .use(async (ctx, next) => {
      ctx.ok(ctx.req.query);
      await next();
    })
    .run(
      {
        queryStringParameters: {
          a: "1",
          b: "2",
        },
      },
      {}
    );

  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({
    a: "1",
    b: "2",
  });
});
