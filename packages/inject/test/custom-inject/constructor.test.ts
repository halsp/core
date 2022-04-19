import { Middleware, ReadonlyDict, SfaRequest, TestStartup } from "@sfajs/core";
import "../../src";
import { CreateInject, Inject } from "../../src";

const Headers = CreateInject((ctx) => ctx.req.headers);
const Body = CreateInject((ctx) => ctx.req.body);
const Host = CreateInject((ctx) => ctx.req.getHeader("host"));

@Inject
class TestMiddleware extends Middleware {
  constructor(
    @Headers private readonly headers: ReadonlyDict,
    @Body private readonly body1: any,
    @Body readonly body2: any,
    @Host readonly host: string
  ) {
    super();
  }

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
