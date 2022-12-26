import { LambdaStartup } from "../src";

test("default response", async () => {
  const res = await new LambdaStartup().run({}, {});

  expect(res.isBase64Encoded).toBeFalsy();
  expect(res.headers.t).toBeUndefined();
  expect(res.headers["content-type"]).toBeUndefined();
  expect(res.body).toBe("");
  expect(res.statusCode).toBe(404);
});

test("base response", async () => {
  const result = await new LambdaStartup()
    .use(async (ctx, next) => {
      ctx.res.body = "str body";
      ctx.res.setHeader("t", "test");
      ctx.res.status = 200;
      await next();
    })
    .run({}, {});

  expect(result.headers.t).toBe("test");
  expect(result.body).toBe("str body");
  expect(result.statusCode).toBe(200);
});

test("error response", async () => {
  const result = await new LambdaStartup()
    .use(async (ctx, next) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx.res.status = undefined as any;
      await next();
    })
    .run({}, {});

  expect(result.statusCode).toBe(undefined);
});

test("set json type", async () => {
  const res = await new LambdaStartup()
    .use(async (ctx, next) => {
      ctx.res.setHeader("content-type", "application/json");
      ctx.res.setHeader("content-length", "10");
      ctx.res.ok({
        body: "BODY",
      });
      await next();
    })
    .run({}, {});

  expect(res.headers["content-type"]).toBe("application/json");
  expect(res.headers["content-length"]).toBe("10");
  expect(res.body).toBe(
    JSON.stringify({
      body: "BODY",
    })
  );
  expect(res.statusCode).toBe(200);
});
