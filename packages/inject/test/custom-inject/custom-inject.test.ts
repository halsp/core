import { Middleware, SfaRequest, TestStartup } from "@sfajs/core";
import "../../src";
import { createInject, Inject } from "../../src";

const Headers = Inject((ctx) => ctx.req.headers);

const Host = Inject((ctx) => ctx.req.getHeader("host"));

function Body(property: string): PropertyDecorator;
function Body(target: any, propertyKey: string | symbol): void;
function Body(arg1: any, arg2?: any): PropertyDecorator | void {
  if (typeof arg1 == "string") {
    return Inject((ctx) => ctx.req.body[arg1]);
  } else {
    return createInject((ctx) => ctx.req.body, arg1, arg2);
  }
}

class TestMiddleware extends Middleware {
  @Headers
  private readonly headers!: any;
  @Body
  private readonly body1!: any;
  @Body("b")
  private readonly b!: any;
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
      b: this.b,
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
    b: 2,
  });
  expect(res.status).toBe(200);
});
