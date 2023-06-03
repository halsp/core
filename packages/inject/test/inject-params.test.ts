import { Startup } from "@halsp/core";
import "@halsp/testing";
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
  constructor(
    @Inject("KEY1") readonly key1: number,
    private readonly service1: Service1,
    @Inject("KEY2") readonly key2: string
  ) {
    super();
  }

  public invoke() {
    return {
      service: "service2." + this.service1.invoke(),
      key1: this.key1,
      key2: this.key2,
    };
  }
  public count = 0;
}

test(`inject params`, async function () {
  const { ctx } = await new Startup()
    .useInject()
    .inject("KEY1", 1)
    .use(async (ctx) => {
      const service = await ctx.getService(Service2);
      ctx.set("result", service.invoke());
    })
    .test();

  expect(ctx.get("result")).toEqual({
    service: "service2.service1",
    key1: 1,
    key2: undefined,
  });
});
