import { Context } from "@ipare/core";
import { parseInject } from "@ipare/inject";
import { TestHttpStartup } from "@ipare/testing/dist/http";
import "../src";
import { InjectContext } from "../src";
import { expectBody, getTestRequest } from "./TestMiddleware";

class TestService {
  @InjectContext
  private readonly ctx1!: Context;
  @InjectContext
  private readonly ctx2!: Context;

  invoke() {
    return {
      header: this.ctx1.req.headers,
      query: this.ctx2.req.query,
    };
  }
}

test(`http context`, async () => {
  const res = await new TestHttpStartup()
    .setContext(getTestRequest())
    .useInject()
    .use(async (ctx) => {
      const obj = await parseInject(ctx, new TestService());
      return ctx.res.ok(obj.invoke());
    })
    .run();
  expect(res.body).toEqual({
    header: expectBody.header,
    query: expectBody.query1,
  });
  expect(res.status).toBe(200);
});
