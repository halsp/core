import { Middleware } from "@ipare/core";
import { TestStartup } from "../src";

class TestMiddleware extends Middleware {
  fn() {
    return 1;
  }

  invoke(): void | Promise<void> {
    this.ok();
  }
}

describe("middleware", () => {
  new TestStartup()
    .expectMiddleware(TestMiddleware, (ctx, md) => {
      expect(md.fn()).toBe(1);
    })
    .add(TestMiddleware)
    .it("should expect middleware");
});
