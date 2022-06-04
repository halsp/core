import { TestStartup, SfaRequest, HttpMethod } from "@sfajs/core";
import "../../src";
import "../global";

test(`restful params test1`, async () => {
  const res = await new TestStartup(
    new SfaRequest().setPath("/restful/45").setMethod(HttpMethod.get)
  )
    .useTestRouter()
    .run();
  expect(res.body).toEqual({
    id1: "45",
    id2: "45",
    method: "GET",
  });
  expect(res.status).toBe(200);
});

test(`restful params test2`, async () => {
  const res = await new TestStartup(
    new SfaRequest().setPath("/restful/11/animals").setMethod(HttpMethod.get)
  )
    .useTestRouter()
    .run();

  expect(res.body).toEqual({
    id: "11",
    method: "GET",
  });
  expect(res.status).toBe(200);
});

test(`get params one object`, async () => {
  const res = await new TestStartup(
    new SfaRequest().setPath("/restful/45").setMethod(HttpMethod.get)
  )
    .use(async (ctx, next) => {
      expect(ctx.req.params).toBe(ctx.req.params);
      await next();
    })
    .useTestRouter()
    .run();
  expect(res.status).toBe(200);
});
