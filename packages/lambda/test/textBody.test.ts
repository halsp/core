import { SfaCloudbase } from "../src";

test("string body", async function () {
  const result = await new SfaCloudbase()
    .use(async (ctx) => {
      ctx.res.body = ctx.req.body;
    })
    .run(
      {
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          test: "sfa",
        }),
      },
      {}
    );

  expect(result.body).toEqual({ test: "sfa" });
});

test("string body without conent-type", async function () {
  const result = await new SfaCloudbase()
    .use(async (ctx) => {
      ctx.res.body = ctx.req.body;
    })
    .run(
      {
        headers: {},
        body: JSON.stringify({
          test: "sfa",
        }),
      },
      {}
    );

  expect(result.body).toBe(
    JSON.stringify({
      test: "sfa",
    })
  );
});

test("set text type", async function () {
  const res = await new SfaCloudbase()
    .use(async (ctx, next) => {
      ctx.res.setHeader("content-type", "text/plain");
      ctx.res.setHeader("content-length", "10");
      ctx.ok("BODY");
      await next();
    })
    .run({}, {});

  expect(res.headers["content-type"]).toBe("text/plain");
  expect(res.headers["content-length"]).toBe("10");
  expect(res.body).toBe("BODY");
  expect(res.statusCode).toBe(200);
});

test("html", async function () {
  const res = await new SfaCloudbase()
    .use(async (ctx, next) => {
      ctx.ok("<div></div>");
      await next();
    })
    .run({}, {});

  expect(res.headers["content-type"]).toBe("text/html; charset=utf-8");
  expect(res.statusCode).toBe(200);
});
