import { HttpMethods } from "@halsp/methods";
import { Request, Startup } from "@halsp/core";
import "@halsp/testing";
import "../../src";
import "../utils-http";

test(`restful params test1`, async () => {
  const res = await new Startup()
    .useHttp()
    .setContext(new Request().setPath("/restful/45").setMethod(HttpMethods.get))
    .useTestRouter()
    .test();
  expect(res.body).toEqual({
    id1: "45",
    id2: "45",
    method: "GET",
  });
  expect(res.status).toBe(200);
});

test(`restful params test2`, async () => {
  const res = await new Startup()
    .useHttp()
    .setContext(
      new Request().setPath("/restful/11/animals").setMethod(HttpMethods.get)
    )
    .useTestRouter()
    .test();

  expect(res.body).toEqual({
    id: "11",
    method: "GET",
  });
  expect(res.status).toBe(200);
});

test(`get params one object`, async () => {
  const res = await new Startup()
    .useHttp()
    .setContext(new Request().setPath("/restful/45").setMethod(HttpMethods.get))
    .use(async (ctx, next) => {
      expect(ctx.req.params).toBe(ctx.req.params);
      await next();
    })
    .useTestRouter()
    .test();
  expect(res.status).toBe(200);
});
