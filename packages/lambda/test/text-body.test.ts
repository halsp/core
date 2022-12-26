import { LambdaStartup } from "../src";

test("string body", async () => {
  const result = await new LambdaStartup()
    .use(async (ctx) => {
      ctx.res.body = ctx.req.body;
    })
    .run(
      {
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          test: "ipare",
        }),
      },
      {}
    );

  expect(result.body).toBe(JSON.stringify({ test: "ipare" }));
});

test("string body without conent-type", async () => {
  const result = await new LambdaStartup()
    .use(async (ctx) => {
      ctx.res.body = ctx.req.body;
    })
    .run(
      {
        headers: {},
        body: JSON.stringify({
          test: "ipare",
        }),
      },
      {}
    );

  expect(result.body).toBe(
    JSON.stringify({
      test: "ipare",
    })
  );
});

test("set text type", async () => {
  const res = await new LambdaStartup()
    .use(async (ctx, next) => {
      ctx.res.setHeader("content-type", "text/plain");
      ctx.res.setHeader("content-length", "10");
      ctx.res.ok("BODY");
      await next();
    })
    .run({}, {});

  expect(res.headers["content-type"]).toBe("text/plain");
  expect(res.headers["content-length"]).toBe("10");
  expect(res.body).toBe("BODY");
  expect(res.statusCode).toBe(200);
});

test("html", async () => {
  const res = await new LambdaStartup()
    .use(async (ctx, next) => {
      ctx.res.ok("<div></div>");
      await next();
    })
    .run({}, {});

  expect(res.headers["content-type"]).toBe("text/html; charset=utf-8");
  expect(res.statusCode).toBe(200);
});
