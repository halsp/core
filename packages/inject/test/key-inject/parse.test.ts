import { Middleware, Startup } from "@halsp/core";
import "@halsp/testing";
import "../../src";
import { InjectType, parseInject, tryParseInject } from "../../src";

class TestService1 {}

class TestMiddleware extends Middleware {
  async invoke(): Promise<void> {
    this.ctx.set("result", {
      key: await parseInject(this.ctx, "KEY"),
      sv1:
        (await parseInject<TestService1>(this.ctx, "SERVICE1")) ==
        (await parseInject<TestService1>(this.ctx, "SERVICE1")),
      sv2:
        (await parseInject<TestService1>(this.ctx, "SERVICE2")) ==
        (await parseInject<TestService1>(this.ctx, "SERVICE2")),
      notExist: await parseInject(this.ctx, "notExist"),
    });
  }
}

test(`inject key`, async function () {
  const { ctx } = await new Startup()
    .useInject()
    .inject("KEY", 1)
    .inject("SERVICE1", TestService1)
    .inject("SERVICE2", TestService1, InjectType.Transient)
    .add(TestMiddleware)
    .test();

  expect(ctx.get("result")).toEqual({
    key: 1,
    sv1: true,
    sv2: false,
    notExist: undefined,
  });
});

test(`try parse`, async function () {
  const { ctx } = await new Startup()
    .useInject()
    .inject("SERVICE1", TestService1)
    .use(async (ctx) => {
      const obj1 = tryParseInject(ctx, "SERVICE1");
      const obj2 = await parseInject(ctx, "SERVICE1");
      const obj3 = tryParseInject(ctx, "SERVICE1");
      return ctx.set("result", {
        obj1: !!obj1,
        obj2: !!obj2,
        obj3: !!obj3,
      });
    })
    .test();
  expect(ctx.get("result")).toEqual({
    obj1: false,
    obj2: true,
    obj3: true,
  });
});
