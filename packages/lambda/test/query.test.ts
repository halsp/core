import { LambdaStartup } from "../src";

test("query", async () => {
  const res = await new LambdaStartup()
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
  expect(res.body).toBe(
    JSON.stringify({
      a: "1",
      b: "2",
    })
  );
});
