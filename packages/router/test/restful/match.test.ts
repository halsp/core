import "../../src";
import { HttpMethods } from "@halsp/methods";
import "@halsp/testing";
import "@halsp/http";
import "../utils";
import { Context, Request, Startup } from "@halsp/core";

test(`find next`, async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(
      new Request().setPath("/restful/method").setMethod(HttpMethods.post)
    )
    .useTestRouter()
    .test();
  expect(result.status).toBe(200);
});

test(`find simple`, async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(
      new Request()
        .setPath("/restful/method/simple")
        .setMethod(HttpMethods.post)
    )
    .useTestRouter()
    .test();
  expect(result.status).toBe(200);
  expect(result.body.action).toBe("simple");
});

test(`find simple next`, async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(
      new Request().setPath("/restful/method/any").setMethod(HttpMethods.post)
    )
    .useTestRouter()
    .test();
  expect(result.status).toBe(200);
  expect(result.body.action).toBe("params");
});

test(`find miss next`, async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(
      new Request().setPath("/restful/method/miss").setMethod(HttpMethods.post)
    )
    .useTestRouter()
    .test();
  expect(result.status).toBe(200);
  expect(result.body.action).toBe("miss");
  expect(result.body.action).not.toBe("params");
});

test(`find miss next 2`, async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(
      new Request()
        .setPath("/restful/method/miss/any")
        .setMethod(HttpMethods.post)
    )
    .useTestRouter()
    .test();
  expect(result.status).toBe(200);
  expect(result.body.action).toBe("miss/params");
});

test(`find miss next 3`, async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(
      new Request()
        .setPath("/restful/method/any/miss")
        .setMethod(HttpMethods.post)
    )
    .useTestRouter()
    .test();
  expect(result.status).toBe(200);
  expect(result.body.action).toBe("params/miss");
});

test(`find miss next 4`, async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(
      new Request()
        .setPath("/restful/method/any/any")
        .setMethod(HttpMethods.post)
    )
    .useTestRouter()
    .test();
  expect(result.status).toBe(200);
  expect(result.body.action).toBe("params2/nextParams");
});

test(`mostLikePathParts`, async () => {
  let context!: Context;
  const result = await new Startup()
    .useHttp()
    .setContext(
      new Request()
        .setPath("/restful/mostLike/q/act")
        .setMethod(HttpMethods.post)
    )
    .use(async (ctx, next) => {
      context = ctx;
      await next();
    })
    .useTestRouter()
    .test();
  expect(result.status).toBe(204);
  expect(context.actionMetadata.path).toBe("restful/mostLike/^id1/act.post.ts");
});

test(`find sortest`, async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(
      new Request().setPath("/restful/sortest/sort").setMethod(HttpMethods.get)
    )
    .useTestRouter()
    .test();
  expect(result.status).toBe(200);
  expect(result.body).toBe("outer");
});
