import { HttpContext } from "@halsp/http";
import { parseInject } from "@halsp/inject";
import { TestHttpStartup } from "@halsp/testing/dist/http";
import "../src";
import { Ctx } from "../src";
import { expectBody, getTestRequest } from "./TestMiddleware";

class TestService {
  @Ctx
  private readonly ctx1!: HttpContext;
  @Ctx
  private readonly ctx2!: HttpContext;

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
