import { Middleware, TestStartup } from "@ipare/core";
import "../src";
import { Service2, Service3 } from "./services";
import { Inject } from "../src";

class TestMiddleware extends Middleware {
  @Inject
  private readonly service2!: Service2;
  @Inject
  private readonly service3!: Service3;

  async invoke(): Promise<void> {
    this.ok({
      service2: this.service2.invoke(),
      service3: this.service3.invoke(),
    });
  }
}

test(`derive`, async function () {
  const res = await new TestStartup()
    .useInject()
    .inject(Service2, Service3)
    .add(TestMiddleware)
    .run();

  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    service2: "service3.service2.service1",
    service3: "service3.service2.service1",
  });
});
