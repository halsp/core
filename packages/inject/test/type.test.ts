import { Middleware, SfaRequest, TestStartup } from "@sfajs/core";
import "../src";
import { Service1, Service2 } from "./services";
import { Inject, InjectType } from "../src";

class TestMiddleware extends Middleware {
  @Inject
  private readonly singletonService1!: Service1;
  @Inject
  private readonly singletonService2!: Service1;

  async invoke(): Promise<void> {
    this.singletonService1.count++;
    this.singletonService2.count += 3;

    this.ok({
      singleton1: this.singletonService1.count,
      singleton2: this.singletonService2.count,
    });
  }
}

function runTest(type: InjectType) {
  test(`inject type ${type}`, async function () {
    const startup = new TestStartup()
      .useInject()
      .inject(Service1, type)
      .inject(Service2)
      .add(TestMiddleware);

    let res = await startup.run(new SfaRequest());

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      singleton1: type == InjectType.Transient ? 1 : 4,
      singleton2: type == InjectType.Transient ? 3 : 4,
    });

    res = await startup.run(new SfaRequest());
    expect(res.status).toBe(200);
    if (type == InjectType.Transient) {
      expect(res.body).toEqual({
        singleton1: 1,
        singleton2: 3,
      });
    } else if (type == InjectType.Scoped) {
      expect(res.body).toEqual({
        singleton1: 4,
        singleton2: 4,
      });
    } else if (type == InjectType.Singleton) {
      expect(res.body).toEqual({
        singleton1: 8,
        singleton2: 8,
      });
    }
  });
}

runTest(InjectType.Scoped);
runTest(InjectType.Singleton);
runTest(InjectType.Transient);
