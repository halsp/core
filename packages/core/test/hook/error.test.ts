import { HookType, Middleware } from "../../src";
import { TestStartup } from "../test-startup";

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
    const { ctx } = await new TestStartup()
      .use(async (ctx, next) => {
        ctx.catchError = (err) => {
          ctx.bag("result", err.message);
          return ctx;
        };
        await next();
      })
      .hook(HookType.Error, (ctx, middleware, error) => {
        errorMiddleware = middleware;
        ctx.bag("result", {
          message: error.message,
        });
        return handle;
      })
      .add(TestMiddleware)
      .use((ctx) => {
        ctx.bag("h", 1);
      })
      .add(TestMiddleware)
      .run();

    expect(ctx.bag("result")).toEqual(
      handle
        ? {
            message: "err",
          }
        : "err"
    );
    expect(ctx.bag("h")).toBe(afterNext ? 1 : undefined);
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
    const { ctx } = await new TestStartup()
      .use(async (ctx, next) => {
        ctx.catchError = (err) => {
          ctx.bag("result", err.message);
          return ctx;
        };
        await next();
      })
      .hook(HookType.BeforeNext, (ctx, middleware) => {
        if (middleware instanceof TestMiddleware) {
          const err = new Error();
          err.message = "err";
          throw err;
        }
      })
      .hook(HookType.Error, (ctx, middleware, error) => {
        errorMiddleware = middleware;
        ctx.bag("result", {
          message: error.message,
        });
        return handle;
      })
      .add(TestMiddleware)
      .use((ctx) => {
        ctx.bag("h", 1);
      })
      .add(TestMiddleware)
      .run();

    expect(ctx.bag("result")).toEqual(
      handle
        ? {
            message: "err",
          }
        : "err"
    );
    expect(ctx.bag("h")).toBe(undefined);
    expect(errorMiddleware.constructor).toBe(TestMiddleware);
  });
}

runBeforeNextTest(true);
runBeforeNextTest(false);
