import { HttpContext, TestStartup } from "@sfajs/core";
import "../src";
import { parseReqDeco } from "../src";
import { Ctx } from "../src/decorators";
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

test(`http context`, async function () {
  const res = await new TestStartup(getTestRequest())
    .use(async (ctx) => {
      const obj = parseReqDeco(ctx, new TestService());
      return ctx.ok(obj.invoke());
    })
    .run();
  expect(res.body).toEqual({
    header: expectBody.header,
    query: expectBody.query1,
  });
  expect(res.status).toBe(200);
});
