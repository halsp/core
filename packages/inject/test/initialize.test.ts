import { Startup } from "@halsp/core";
import "@halsp/testing";
import { Inject } from "../src";

describe("initialize", () => {
  it("should execute initializing and initialized", async () => {
    let initializingExecuted = false;
    let initializedExecuted = false;
    class TestService {
      initializing() {
        initializingExecuted = true;
      }
      initialized() {
        initializedExecuted = true;
      }
    }

    await new Startup()
      .useInject()
      .use(async (ctx) => {
        await ctx.getService(TestService);
      })
      .test();

    expect(initializingExecuted).toBeTruthy();
    expect(initializedExecuted).toBeTruthy();
  });

  it("should not execute initializing and initialized again", async () => {
    let initializingExecuted = 0;
    let initializedExecuted = 0;
    class TestService {
      initializing() {
        initializingExecuted++;
      }
      initialized() {
        initializedExecuted++;
      }
    }

    await new Startup()
      .useInject()
      .use(async (ctx, next) => {
        await ctx.getService(TestService);
        await ctx.getService(TestService);
        await next();
      })
      .use(async (ctx) => {
        await ctx.getService(TestService);
        await ctx.getService(TestService);
      })
      .test();

    expect(initializingExecuted).toBe(1);
    expect(initializedExecuted).toBe(1);
  });

  it("should get injecting service undefined when initializing", async () => {
    let execute = 0;

    class TestService1 {}
    class TestService2 {
      @Inject
      private readonly service1!: TestService1;

      initializing() {
        execute++;
        expect(!!this.service1).toBeFalsy();
      }
      initialized() {
        execute++;
        expect(!!this.service1).toBeTruthy();
      }
    }

    await new Startup()
      .useInject()
      .use(async (ctx) => {
        await ctx.getService(TestService2);
      })
      .test();

    expect(execute).toBe(2);
  });
});
