import { Middleware, SfaRequest, TestStartup } from "@sfajs/core";
import "../../src";
import { CreateInject } from "../../src";

const Headers = CreateInject(null as any);

class TestMiddleware extends Middleware {
  @Headers
  private readonly headers!: any;

  async invoke(): Promise<void> {
    this.ok({
      headers: this.headers,
    });
  }
}

test(`custom inject`, async function () {
  const res = await new TestStartup(new SfaRequest().setHeader("h1", "1"))
    .useInject()
    .add(TestMiddleware)
    .run();

  expect(res.body).toEqual({
    headers: undefined,
  });
  expect(res.status).toBe(200);
});
