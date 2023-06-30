import { Context, Middleware, Startup } from "@halsp/core";
import "../src";
import { Service1, Service2 } from "./services";
import { Inject } from "../src";
import "@halsp/testing";

it(`inject decorators`, async function () {
  class TestMiddleware extends Middleware {
    @Inject
    private readonly service1!: Service1;
    @Inject
    private readonly service11!: Service1;
    @Inject
    private readonly service2!: Service2;

    async invoke(): Promise<void> {
      this.ctx.set("result", {
        service1: this.service1?.invoke(),
        service11: this.service11?.invoke(),
        service2: this.service2?.invoke(),
        count: this.service1.count,
      });
    }
  }

  const { ctx } = await new Startup()
    .useInject()
    .useInject()
    .add(TestMiddleware)
    .test();
  expect(ctx.get("result")).toEqual({
    service1: "service1",
    service11: "service1",
    service2: "service2.service1",
    count: 3,
  });
});

it("should inject Context", async () => {
  class TestMiddleware extends Middleware {
    @Inject
    private readonly ctx1!: Context;

    invoke() {
      expect(this.ctx1).toBe(this.ctx);
      this.ctx.set("ctx", this.ctx1);
    }
  }

  const { ctx } = await new Startup().useInject().add(TestMiddleware).test();

  expect(ctx.get("ctx")).toBe(ctx);
});

it("should return ctx when get Context without useInject", async () => {
  class TestMiddleware extends Middleware {
    @Inject
    private readonly ctx1!: Context;

    invoke() {
      this.ctx.set("ctx", this.ctx1);
    }
  }

  const { ctx } = await new Startup().add(TestMiddleware).test();

  expect(ctx.get("ctx")).toBeUndefined();
});
