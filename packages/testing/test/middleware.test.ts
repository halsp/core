import { HookType, Middleware, Startup } from "@halsp/core";
import "../src";

class TestMiddleware extends Middleware {
  fn() {
    return 1;
  }

  invoke(): void | Promise<void> {
    this.ctx.set("result", "OK");
  }
}

describe("middleware", () => {
  it("should expect middleware", async () => {
    await new Startup()
      .keepThrow()
      .expectMiddleware(TestMiddleware, (md) => {
        expect(md.fn()).toBe(1);
      })
      .add(TestMiddleware)
      .test();
  });

  it("should expect before invoke", async () => {
    await new Startup()
      .keepThrow()
      .expectMiddleware(TestMiddleware, (md) => {
        expect(md.ctx.get("result")).toBeUndefined();
      })
      .add(TestMiddleware)
      .test();
  });

  it("should expect after invoke", async () => {
    await new Startup()
      .keepThrow()
      .expectMiddleware(
        TestMiddleware,
        (md) => {
          expect(md.fn()).toBe(1);
        },
        HookType.AfterInvoke,
      )
      .add(TestMiddleware)
      .test();
  });

  it("should throw error if middleware not executed", async () => {
    const startup = new Startup()
      .keepThrow()
      .expectMiddleware(TestMiddleware, () => undefined);
    let err: any;
    try {
      await startup.test();
    } catch (error) {
      err = error;
    }
    expect(err.message).toBe("The middleware is not executed!");
  });
});
