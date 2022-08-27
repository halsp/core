import { TestStartup } from "@ipare/testing";
import { Inject, parseInject } from "../src";

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

    await new TestStartup()
      .useInject()
      .use(async (ctx) => {
        await parseInject(ctx, TestService);
      })
      .run();

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

    await new TestStartup()
      .useInject()
      .use(async (ctx, next) => {
        await parseInject(ctx, TestService);
        await parseInject(ctx, TestService);
        await next();
      })
      .use(async (ctx) => {
        await parseInject(ctx, TestService);
        await parseInject(ctx, TestService);
      })
      .run();

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

    await new TestStartup()
      .useInject()
      .use(async (ctx) => {
        await parseInject(ctx, TestService2);
      })
      .run();

    expect(execute).toBe(2);
  });
});
