import { Middleware } from "@ipare/core";
import { Service2 } from "./services";
import { Inject } from "../src";
import { TestStartup } from "@ipare/testing";

@Inject
class TestMiddleware extends Middleware {
  constructor(
    private readonly service: Service2,
    @Inject("KEY_INJ") private readonly num: number,
    private readonly str: string
  ) {
    super();
  }

  async invoke(): Promise<void> {
    this.ctx.bag("result", {
      md: `md.${this.service?.invoke()}`,
      num: this.num,
      str: this.str,
    });
  }
}

test(`middleware constructor`, async () => {
  const { ctx } = await new TestStartup().useInject().add(TestMiddleware).run();

  expect(ctx.bag("result")).toEqual({
    md: "md.service2.service1",
    num: undefined,
    str: undefined,
  });
});

test(`function middleware constructor`, async () => {
  const { ctx } = await new TestStartup()
    .useInject()
    .inject("KEY_INJ", 3)
    .add((ctx) => {
      ctx.bag("h", "1");
      return TestMiddleware;
    })
    .run();

  expect(ctx.bag("result")).toEqual({
    md: "md.service2.service1",
    num: 3,
    str: undefined,
  });
  expect(ctx.bag("h")).toBe("1");
});

test(`async function middleware constructor`, async () => {
  const { ctx } = await new TestStartup()
    .useInject()
    .add(async (ctx) => {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 200);
      });
      ctx.bag("h", "1");
      return TestMiddleware;
    })
    .run();

  expect(ctx.bag("result")).toEqual({
    md: "md.service2.service1",
    num: undefined,
    str: undefined,
  });
  expect(ctx.bag("h")).toBe("1");
});
