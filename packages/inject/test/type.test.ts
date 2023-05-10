import { Middleware, Startup } from "@halsp/core";
import "../src";
import { Service1, Service2 } from "./services";
import { Inject, InjectType } from "../src";
import "@halsp/testing";

class TestMiddleware extends Middleware {
  @Inject
  private readonly singletonService1!: Service1;
  @Inject
  private readonly singletonService2!: Service1;

  async invoke(): Promise<void> {
    this.singletonService1.count++;
    this.singletonService2.count += 3;

    this.ctx.set("result", {
      singleton1: this.singletonService1.count,
      singleton2: this.singletonService2.count,
    });
  }
}

function runTest(type: InjectType) {
  test(`inject type ${type}`, async function () {
    const startup = new Startup()
      .useInject()
      .inject(Service1, type)
      .inject(Service2)
      .add(TestMiddleware);

    let res = await startup.test();
    let ctx = res.ctx;

    expect(ctx.get("result")).toEqual({
      singleton1: type == InjectType.Transient ? 1 : 4,
      singleton2: type == InjectType.Transient ? 3 : 4,
    });

    res = await startup.test();
    ctx = res.ctx;
    if (type == InjectType.Transient) {
      expect(ctx.get("result")).toEqual({
        singleton1: 1,
        singleton2: 3,
      });
    } else if (type == InjectType.Scoped) {
      expect(ctx.get("result")).toEqual({
        singleton1: 4,
        singleton2: 4,
      });
    } else if (type == InjectType.Singleton) {
      expect(ctx.get("result")).toEqual({
        singleton1: 8,
        singleton2: 8,
      });
    }
  });
}

runTest(InjectType.Scoped);
runTest(InjectType.Singleton);
runTest(InjectType.Transient);
