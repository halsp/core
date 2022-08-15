import "../../src";
import { Request, HttpContext, HttpMethod } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../global";

test(`find next`, async () => {
  const result = await new TestStartup()
    .setRequest(
      new Request().setPath("/restful/method").setMethod(HttpMethod.post)
    )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
});

test(`find simple`, async () => {
  const result = await new TestStartup()
    .setRequest(
      new Request().setPath("/restful/method/simple").setMethod(HttpMethod.post)
    )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
  expect(result.body.action).toBe("simple");
});

test(`find simple next`, async () => {
  const result = await new TestStartup()
    .setRequest(
      new Request().setPath("/restful/method/any").setMethod(HttpMethod.post)
    )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
  expect(result.body.action).toBe("params");
});

test(`find miss next`, async () => {
  const result = await new TestStartup()
    .setRequest(
      new Request().setPath("/restful/method/miss").setMethod(HttpMethod.post)
    )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
  expect(result.body.action).toBe("miss");
  expect(result.body.action).not.toBe("params");
});

test(`find miss next 2`, async () => {
  const result = await new TestStartup()
    .setRequest(
      new Request()
        .setPath("/restful/method/miss/any")
        .setMethod(HttpMethod.post)
    )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
  expect(result.body.action).toBe("miss/params");
});

test(`find miss next 3`, async () => {
  const result = await new TestStartup()
    .setRequest(
      new Request()
        .setPath("/restful/method/any/miss")
        .setMethod(HttpMethod.post)
    )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
  expect(result.body.action).toBe("params/miss");
});

test(`find miss next 4`, async () => {
  const result = await new TestStartup()
    .setRequest(
      new Request()
        .setPath("/restful/method/any/any")
        .setMethod(HttpMethod.post)
    )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
  expect(result.body.action).toBe("params2/nextParams");
});

test(`mostLikePathParts`, async () => {
  let context!: HttpContext;
  const result = await new TestStartup()
    .setRequest(
      new Request()
        .setPath("/restful/mostLike/q/act")
        .setMethod(HttpMethod.post)
    )
    .use(async (ctx, next) => {
      context = ctx;
      await next();
    })
    .useTestRouter()
    .run();
  expect(result.status).toBe(204);
  expect(context.actionMetadata.path).toBe("restful/mostLike/^id1/act.post.ts");
});

test(`find sortest`, async () => {
  const result = await new TestStartup()
    .setRequest(
      new Request().setPath("/restful/sortest/sort").setMethod(HttpMethod.get)
    )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("outer");
});
