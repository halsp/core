import { StatusCode } from "sfa";
import SfaCloudbase from "../src";

test("default response", async function () {
  const result = await new SfaCloudbase({}, {}).run();

  expect(result.isBase64Encoded).toBeFalsy();
  expect(result.headers.t).toBe(undefined);
  expect(Object.keys(result.body as Record<string, unknown>).length).toBe(0);
  expect(result.statusCode).toBe(StatusCode.notFound);
});

test("base response", async function () {
  const result = await new SfaCloudbase({}, {})
    .use(async (ctx, next) => {
      ctx.res.isBase64Encoded = true;
      ctx.res.body = "str body";
      ctx.res.headers.t = "test";
      ctx.res.status = StatusCode.ok;
      await next();
    })
    .run();

  expect(result.isBase64Encoded).toBeTruthy();
  expect(result.headers.t).toBe("test");
  expect(result.body).toBe("str body");
  expect(result.statusCode).toBe(200);
});

test("error response", async function () {
  const result = await new SfaCloudbase({}, {})
    .use(async (ctx, next) => {
      ctx.res.status = StatusCode.badRequest;
      await next();
    })
    .run();

  expect(result.statusCode).toBe(400);
});
