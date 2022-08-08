import { HttpContext } from "@ipare/core";
import { parseInject } from "@ipare/inject";
import { TestStartup } from "@ipare/testing";
import "../src";
import { Context } from "../src";
import { expectBody, getTestRequest } from "./TestMiddleware";

class TestService {
  @Context
  private readonly ctx1!: HttpContext;
  @Context
  private readonly ctx2!: HttpContext;

  invoke() {
    return {
      header: this.ctx1.req.headers,
      query: this.ctx2.req.query,
    };
  }
}

test(`http context`, async () => {
  const res = await new TestStartup({
    req: getTestRequest(),
  })
    .useInject()
    .use(async (ctx) => {
      const obj = await parseInject(ctx, new TestService());
      return ctx.ok(obj.invoke());
    })
    .run();
  expect(res.body).toEqual({
    header: expectBody.header,
    query: expectBody.query1,
  });
  expect(res.status).toBe(200);
});
