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
  new TestStartup()
    .expectMiddleware(TestMiddleware, (md) => {
      expect(md.fn()).toBe(1);
    })
    .add(TestMiddleware)
    .it("should expect middleware");

  new TestStartup()
    .expectMiddleware(TestMiddleware, (md) => {
      expect(md.ctx.bag("result")).toBeUndefined();
    })
    .add(TestMiddleware)
    .it("should expect before invoke");

  new TestStartup()
    .expectMiddleware(
      TestMiddleware,
      (md) => {
        expect(md.fn()).toBe(1);
      },
      HookType.AfterInvoke
    )
    .add(TestMiddleware)
    .it("should expect after invoke");
});
