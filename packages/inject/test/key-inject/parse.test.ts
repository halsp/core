import { Middleware, TestStartup } from "@ipare/core";
import "../../src";
import { InjectType, parseKeyInject } from "../../src";

class TestService1 {}

class TestMiddleware extends Middleware {
  async invoke(): Promise<void> {
    this.ok({
      key: await parseKeyInject(this.ctx, "KEY"),
      sv1:
        (await parseKeyInject<TestService1>(this.ctx, "SERVICE1")) ==
        (await parseKeyInject<TestService1>(this.ctx, "SERVICE1")),
      sv2:
        (await parseKeyInject<TestService1>(this.ctx, "SERVICE2")) ==
        (await parseKeyInject<TestService1>(this.ctx, "SERVICE2")),
      notExist: await parseKeyInject(this.ctx, "notExist"),
    });
  }
}

test(`inject key`, async function () {
  const res = await new TestStartup()
    .useInject()
    .inject("KEY", 1)
    .inject("SERVICE1", TestService1)
    .inject("SERVICE2", TestService1, InjectType.Transient)
    .add(TestMiddleware)
    .run();

  expect(res.body).toEqual({
    key: 1,
    sv1: true,
    sv2: false,
    notExist: undefined,
  });
  expect(res.status).toBe(200);
});
