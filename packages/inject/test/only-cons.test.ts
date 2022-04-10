import { Middleware, TestStartup } from "@sfajs/core";
import "../src";
import { Service1 } from "./services";
import { Inject, InjectType } from "../src";

class TestMiddleware extends Middleware {
  @Inject
  private readonly service1!: Service1;
  @Inject
  private readonly service2!: Service1;

  async invoke(): Promise<void> {
    this.service1.count++;
    this.service2.count += 2;
    this.ok({
      service1: this.service1.count,
      service2: this.service2.count,
    });
  }
}

function runTest(type?: InjectType) {
  test(`only cons ${type}`, async function () {
    const res = await new TestStartup()
      .useInject()
      .inject(Service1, type)
      .add(TestMiddleware)
      .run();
    expect(res.body).toEqual({
      service1: type == InjectType.Singleton || type == undefined ? 3 : 1,
      service2: type == InjectType.Singleton || type == undefined ? 3 : 2,
    });
    expect(res.status).toBe(200);
  });
}

runTest(undefined);
runTest(InjectType.Transient);
runTest(InjectType.Singleton);
