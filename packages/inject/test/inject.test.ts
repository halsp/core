import { Middleware, TestStartup } from "@sfajs/core";
import "../src";
import { Service1, Service2 } from "./services";
import { parseInject, Inject, InjectDecoratorTypes } from "../src";

class TestMiddleware extends Middleware {
  @Inject()
  private readonly service1!: Service1;
  @Inject()
  private readonly service11!: Service1;
  @Inject()
  private readonly service2!: Service2;

  @Inject(InjectDecoratorTypes.Singleton)
  private readonly singletonService1!: Service1;
  @Inject(InjectDecoratorTypes.Singleton)
  private readonly singletonService2!: Service1;

  @Inject(InjectDecoratorTypes.Scoped)
  private readonly scopedService!: Service1;

  async invoke(): Promise<void> {
    this.singletonService1.count++;
    this.singletonService2.count += 3;

    this.scopedService.count++;

    this.ok({
      service1: this.service1.invoke(),
      service11: this.service11.invoke(),
      service2: this.service2.invoke(),
      singleton1: this.singletonService1.count,
      singleton2: this.singletonService2.count,
      scopedService: this.scopedService.count,
    });
  }
}

test(`inject decorators`, async function () {
  const res = await new TestStartup().useInject().add(TestMiddleware).run();
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    service1: "service1",
    service11: "service1",
    service2: "service2.service1",
    singleton1: 4,
    singleton2: 4,
    scopedService: 1,
  });
});

test(`inject decorators object`, async function () {
  const res = await new TestStartup()
    .use((ctx) => {
      const obj = parseInject(ctx, Service2);
      return ctx.ok(obj.invoke());
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.body).toBe("service2.service1");
});

test(`inject decorators`, async function () {
  const res = await new TestStartup()
    .use((ctx) => {
      const obj = parseInject(ctx, Service2);
      return ctx.ok(obj.invoke());
    })
    .run();
  expect(res.status).toBe(200);
  expect(res.body).toBe("service2.service1");
});
