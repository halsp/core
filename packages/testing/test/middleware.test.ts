import { HookType, Middleware } from "@ipare/core";
import { TestStartup } from "../src";

class TestMiddleware extends Middleware {
  fn() {
    return 1;
  }

  invoke(): void | Promise<void> {
    this.ctx.bag("result", "OK");
  }
}

describe("middleware", () => {
  it("should expect middleware", async () => {
    await new TestStartup()
      .expectMiddleware(TestMiddleware, (md) => {
        expect(md.fn()).toBe(1);
      })
      .add(TestMiddleware)
      .run();
  });

  it("should expect before invoke", async () => {
    await new TestStartup()
      .expectMiddleware(TestMiddleware, (md) => {
        expect(md.ctx.bag("result")).toBeUndefined();
      })
      .add(TestMiddleware)
      .run();
  });

  it("should expect after invoke", async () => {
    await new TestStartup()
      .expectMiddleware(
        TestMiddleware,
        (md) => {
          expect(md.fn()).toBe(1);
        },
        HookType.AfterInvoke
      )
      .add(TestMiddleware)
      .run();
  });

  it("should throw error if middleware not executed", async () => {
    const startup = new TestStartup().expectMiddleware(
      TestMiddleware,
      () => undefined
    );
    let err: any;
    try {
      await startup.run();
    } catch (error) {
      err = error;
    }
    expect(err.message).toBe("The middleware is not executed!");
  });
});
