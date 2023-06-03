import { Startup } from "@halsp/core";
import "@halsp/testing";
import { Inject } from "../../src";

it("key chain inject", async () => {
  class TestService1 {}

  class TestService2 {
    @Inject
    readonly service1!: TestService1;
  }

  class TestService3 {
    @Inject
    readonly service1!: TestService1;
    @Inject
    readonly service2!: TestService2;
  }

  await new Startup()
    .useInject()
    .inject("Test", TestService3)
    .use(async (ctx) => {
      const service3 = await ctx.getService<TestService3>("Test");
      if (!service3) {
        throw new Error();
      }
      expect(service3.constructor).toBe(TestService3);
      expect(service3.service2.constructor).toBe(TestService2);
      expect(service3.service1.constructor).toBe(TestService1);
      expect(service3.service2.service1.constructor).toBe(TestService1);
    })
    .test();
});
