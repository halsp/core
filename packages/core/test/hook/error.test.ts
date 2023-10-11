import { HookType, Middleware, Startup } from "../../src";
import "../test-startup";

function runSimpleTest(handle: boolean, afterNext: boolean) {
  class TestMiddleware extends Middleware {
    async invoke(): Promise<void> {
      if (!afterNext) {
        const err = new Error();
        err.message = "err";
        throw err;
      }
      await this.next();
      if (afterNext) {
        const err = new Error();
        err.message = "err";
        throw err;
      }
    }
  }

  test(`error hook ${handle} ${afterNext}`, async () => {
    let errorMiddleware!: Middleware;
    const { ctx } = await new Startup()
      .hook(HookType.Error, (ctx, middleware, error) => {
        errorMiddleware = middleware;
        ctx.set("result", {
          message: error.message,
        });
        return handle;
      })
      .hook(HookType.Error, (ctx, middleware, error) => {
        ctx.set("result", error.message);
        return true;
      })
      .add(TestMiddleware)
      .use((ctx) => {
        ctx.set("h", 1);
      })
      .add(TestMiddleware)
      .run();

    expect(ctx.get("result")).toEqual(
      handle
        ? {
            message: "err",
          }
        : "err",
    );
    expect(ctx.get("h")).toBe(afterNext ? 1 : undefined);
    expect(errorMiddleware.constructor).toBe(TestMiddleware);
  });
}

runSimpleTest(true, true);
runSimpleTest(true, false);
runSimpleTest(false, true);
runSimpleTest(false, false);

function runBeforeNextTest(handle: boolean) {
  class TestMiddleware extends Middleware {
    async invoke(): Promise<void> {
      await this.next();
    }
  }

  test(`error hook ${handle}`, async () => {
    let errorMiddleware!: Middleware;
    const { ctx } = await new Startup()
      .hook(HookType.BeforeNext, (ctx, middleware) => {
        if (middleware instanceof TestMiddleware) {
          const err = new Error();
          err.message = "err";
          throw err;
        }
      })
      .hook(HookType.Error, (ctx, middleware, error) => {
        errorMiddleware = middleware;
        ctx.set("result", {
          message: error.message,
        });
        return handle;
      })
      .hook(HookType.Error, (ctx, middleware, error) => {
        ctx.set("result", error.message);
        return true;
      })
      .add(TestMiddleware)
      .use((ctx) => {
        ctx.set("h", 1);
      })
      .add(TestMiddleware)
      .run();

    expect(ctx.get("result")).toEqual(
      handle
        ? {
            message: "err",
          }
        : "err",
    );
    expect(ctx.get("h")).toBe(undefined);
    expect(errorMiddleware.constructor).toBe(TestMiddleware);
  });
}

runBeforeNextTest(true);
runBeforeNextTest(false);
