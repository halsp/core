import { Context, Startup } from "@halsp/core";
import "@halsp/http";
import "@halsp/testing";
import "../src";
import { Ctx } from "../src";
import { expectBody, getTestRequest } from "./TestMiddleware";

class TestService {
  @Ctx
  private readonly ctx1!: Context;
  @Ctx
  private readonly ctx2!: Context;

  invoke() {
    return {
      header: this.ctx1.req.headers,
      query: this.ctx2.req.query,
    };
  }
}

test(`http context`, async () => {
  const res = await new Startup()
    .useHttp()
    .setContext(getTestRequest())
    .useInject()
    .use(async (ctx) => {
      const obj = await ctx.getService(new TestService());
      return ctx.res.ok(obj.invoke());
    })
    .test();
  expect(res.body).toEqual({
    header: expectBody.header,
    query: expectBody.query1,
  });
  expect(res.status).toBe(200);
});
