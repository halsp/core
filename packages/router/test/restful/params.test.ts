import { TestStartup, SfaRequest, HttpMethod } from "@sfajs/core";
import "../../src";
import { routerCfg } from "../global";

test(`restful params test1`, async function () {
  const res = await new TestStartup(
    new SfaRequest().setPath("/restful/45").setMethod(HttpMethod.get)
  )
    .useRouter(routerCfg)
    .run();
  expect(res.body).toEqual({
    id1: "45",
    id2: "45",
    method: "GET",
  });
  expect(res.status).toBe(200);
});

test(`restful params test2`, async function () {
  const res = await new TestStartup(
    new SfaRequest().setPath("/restful/11/animals").setMethod(HttpMethod.get)
  )
    .useRouter(routerCfg)
    .run();

  expect(res.body).toEqual({
    id: "11",
    method: "GET",
  });
  expect(res.status).toBe(200);
});

test(`get params one object`, async function () {
  const res = await new TestStartup(
    new SfaRequest().setPath("/restful/45").setMethod(HttpMethod.get)
  )
    .use(async (ctx, next) => {
      expect(ctx.req.params).toBe(ctx.req.params);
      await next();
    })
    .useRouter(routerCfg)
    .run();
  expect(res.status).toBe(200);
});
