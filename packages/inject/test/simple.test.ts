import { Middleware } from "@ipare/core";
import "../src";
import { Service1, Service2 } from "./services";
import { Inject } from "../src";
import { TestStartup } from "@ipare/testing";

class TestMiddleware extends Middleware {
  @Inject
  private readonly service1!: Service1;
  @Inject
  private readonly service11!: Service1;
  @Inject
  private readonly service2!: Service2;

  async invoke(): Promise<void> {
    this.ok({
      service1: this.service1?.invoke(),
      service11: this.service11?.invoke(),
      service2: this.service2?.invoke(),
      count: this.service1.count,
    });
  }
}

test(`inject decorators`, async function () {
  const res = await new TestStartup()
    .useInject()
    .useInject()
    .add(TestMiddleware)
    .run();
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    service1: "service1",
    service11: "service1",
    service2: "service2.service1",
    count: 3,
  });
});
