import { Middleware, Startup } from "@halsp/core";
import "../src";
import { Service1 } from "./services";
import { Inject, InjectType } from "../src";
import "@halsp/testing";

class TestMiddleware extends Middleware {
  @Inject
  private readonly service1!: Service1;
  @Inject
  private readonly service2!: Service1;

  async invoke(): Promise<void> {
    this.service1.count++;
    this.service2.count += 2;
    this.ctx.set("result", {
      service1: this.service1.count,
      service2: this.service2.count,
    });
  }
}

function runTest(type?: InjectType) {
  test(`only cons ${type}`, async function () {
    const { ctx } = await new Startup()
      .useInject()
      .inject(Service1, type)
      .add(TestMiddleware)
      .test();
    expect(ctx.get("result")).toEqual({
      service1: type == InjectType.Singleton || type == undefined ? 3 : 1,
      service2: type == InjectType.Singleton || type == undefined ? 3 : 2,
    });
  });
}

runTest(undefined);
runTest(InjectType.Transient);
runTest(InjectType.Singleton);
