import {
  NotFoundException,
  getReasonPhrase,
  HookType,
  Middleware,
  BadRequestException,
} from "../../src";
import { TestStartup } from "../test-startup";

function runSimpleTest(handle: boolean, afterNext: boolean) {
  class TestMiddleware extends Middleware {
    async invoke(): Promise<void> {
      if (!afterNext) {
        throw new NotFoundException();
      }
      await this.next();
      if (afterNext) {
        throw new NotFoundException();
      }
    }
  }

  test(`exception hook ${handle} ${afterNext}`, async () => {
    let errorMiddleware!: Middleware;
    const res = await new TestStartup()
      .hook(HookType.Exception, (ctx, middleware, exception) => {
        errorMiddleware = middleware;
        ctx.ok({
          message: exception.message,
        });
        return handle;
      })
      .add(TestMiddleware)
      .use((ctx) => {
        ctx.setHeader("h", 1);
      })
      .add(TestMiddleware)
      .run();

    expect(res.status).toBe(handle ? 200 : 404);
    expect(res.body).toEqual(
      handle
        ? {
            message: getReasonPhrase(404),
          }
        : {
            message: getReasonPhrase(404),
            status: 404,
          }
    );
    expect(res.getHeader("h")).toBe(afterNext ? "1" : undefined);
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

  test(`exception hook ${handle}`, async () => {
    let errorMiddleware!: Middleware;
    const res = await new TestStartup()
      .hook(HookType.BeforeNext, (ctx, middleware) => {
        if (middleware instanceof TestMiddleware) {
          throw new BadRequestException();
        }
      })
      .hook(HookType.Exception, (ctx, middleware, exception) => {
        errorMiddleware = middleware;
        ctx.ok({
          message: exception.message,
        });
        return handle;
      })
      .add(TestMiddleware)
      .use((ctx) => {
        ctx.setHeader("h", 1);
      })
      .add(TestMiddleware)
      .run();

    expect(res.status).toBe(handle ? 200 : 400);
    expect(res.body).toEqual(
      handle
        ? {
            message: getReasonPhrase(400),
          }
        : {
            message: getReasonPhrase(400),
            status: 400,
          }
    );
    expect(res.getHeader("h")).toBe(undefined);
    expect(errorMiddleware.constructor).toBe(TestMiddleware);
  });
}

runBeforeNextTest(true);
runBeforeNextTest(false);
