import SfaCloudbase from "../src";

test("string body", async function () {
  const result = await new SfaCloudbase(
    {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        test: "sfa",
      }),
    },
    {}
  )
    .use(async (ctx) => {
      ctx.res.body = ctx.req.body;
    })
    .run();

  expect(result.body).toEqual({ test: "sfa" });
});

test("string body without conent-type", async function () {
  const result = await new SfaCloudbase(
    {
      headers: {},
      body: JSON.stringify({
        test: "sfa",
      }),
    },
    {}
  )
    .use(async (ctx) => {
      ctx.res.body = ctx.req.body;
    })
    .run();

  expect(result.body).toBe(
    JSON.stringify({
      test: "sfa",
    })
  );
});
