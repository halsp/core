import { Middleware, Startup } from "@halsp/core";
import "../src";
import { Service2, Service3 } from "./services";
import { Inject } from "../src";
import "@halsp/testing";

class TestMiddleware extends Middleware {
  @Inject
  private readonly service2!: Service2;
  @Inject
  private readonly service3!: Service3;

  async invoke(): Promise<void> {
    this.ctx.set("result", {
      service2: this.service2.invoke(),
      service3: this.service3.invoke(),
    });
  }
}

test(`derive`, async function () {
  const { ctx } = await new Startup()
    .useInject()
    .inject(Service2, Service3)
    .add(TestMiddleware)
    .test();

  expect(ctx.get("result")).toEqual({
    service2: "service3.service2.service1",
    service3: "service3.service2.service1",
  });
});
