import { Middleware, TestStartup } from "@sfajs/core";
import { Inject } from "../src";

export class Service1 extends Object {
  public invoke(): string {
    this.count++;
    return "service1";
  }

  public count = 0;
}

@Inject
export class Service2 extends Object {
  constructor(private readonly service1: Service1) {
    super();
  }

  public invoke(): string {
    return "service2." + this.service1.invoke();
  }
}

class TestMiddleware extends Middleware {
  @Inject
  private readonly service!: Service2;

  async invoke(): Promise<void> {
    this.ok({
      service: this.service.invoke(),
    });
  }
}

test(`class`, async function () {
  const res = await new TestStartup().useInject().add(TestMiddleware).run();

  expect(res.body).toEqual({
    service: "service2.service1",
  });
  expect(res.status).toBe(200);
});
