import { Middleware, SfaRequest, TestStartup } from "@sfajs/core";
import "../../src";
import { CreateInject, InjectType } from "../../src";

const Headers = CreateInject((ctx) => ctx.req.headers);
const Body = CreateInject((ctx) => ctx.req.body, InjectType.Scoped);
const Host = CreateInject((ctx) => ctx.req.getHeader("host"));

class TestMiddleware extends Middleware {
  @Headers
  private readonly headers!: any;
  @Body
  private readonly body1!: any;
  @Body
  readonly body2!: any;
  @Host
  readonly host!: string;

  async invoke(): Promise<void> {
    this.ok({
      headers: this.headers,
      body1: this.body1,
      body2: this.body2,
      host: this.host,
    });
  }
}

test(`custom inject`, async function () {
  const res = await new TestStartup(
    new SfaRequest().setHeader("h1", "1").setHeader("host", "sfa").setBody({
      b: 2,
    })
  )
    .useInject()
    .add(TestMiddleware)
    .run();

  expect(res.body).toEqual({
    headers: {
      h1: "1",
      host: "sfa",
    },
    body1: {
      b: 2,
    },
    body2: {
      b: 2,
    },
    host: "sfa",
  });
  expect(res.status).toBe(200);
});
