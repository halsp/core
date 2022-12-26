import { Middleware } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import { Inject, InjectType, parseInject } from "../src";

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
  public count = 0;
}

export class Service3 extends Object {
  constructor(
    @Inject private readonly service1: Service1,
    private readonly service2: Service2
  ) {
    super();
  }

  public invoke(): string {
    return "service3." + this.service2.invoke() + "." + this.service1.invoke();
  }
  public count = 0;
}

class TestMiddleware extends Middleware {
  @Inject
  private readonly service!: Service3;

  async invoke(): Promise<void> {
    this.ctx.set("result", {
      service: this.service.invoke(),
    });
  }
}

test(`class`, async function () {
  const { ctx } = await new TestStartup().useInject().add(TestMiddleware).run();

  expect(ctx.get("result")).toEqual({
    service: "service3.service2.service1.service1",
  });
});

test(`class singleton`, async function () {
  const { ctx } = await new TestStartup()
    .useInject()
    .inject(Service2, InjectType.Singleton)
    .use(async (ctx) => {
      const service1 = await parseInject(ctx, Service2);
      service1.count += 1;
      const service2 = await parseInject(ctx, Service2);
      service2.count += 2;
      ctx.set("result", service2.count);
    })
    .run();

  expect(ctx.get("result")).toBe(3);
});
