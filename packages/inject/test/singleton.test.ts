import { Middleware, TestStartup } from "@ipare/core";
import { Inject, InjectType } from "../src";

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
  private readonly service1!: Service1;
  @Inject
  private readonly service2!: Service2;
  @Inject
  private readonly service3!: Service1;

  async invoke(): Promise<void> {
    this.service1.count++;
    this.service3.count++;
    this.ok({
      service1: this.service1.invoke(), // add 1
      service2: this.service2.invoke(), // add 1
      service3: this.service1.invoke(), // add 1
      count: this.service1.count,
    });
  }
}

test(`class`, async function () {
  const res = await new TestStartup()
    .useInject()
    .inject(Service1, InjectType.Singleton)
    .inject(Service2, InjectType.Singleton)
    .add(TestMiddleware)
    .run();

  expect(res.body).toEqual({
    service1: "service1",
    service2: "service2.service1",
    service3: "service1",
    count: 5,
  });
  expect(res.status).toBe(200);
});
