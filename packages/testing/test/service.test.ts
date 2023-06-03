import "@halsp/inject";
import { Startup } from "@halsp/core";
import { Inject } from "@halsp/inject";
import "../src";

class TestService1 {
  fn() {
    return 1;
  }
}
class TestService2 {
  @Inject
  private readonly testService1!: TestService1;

  fn() {
    return this.testService1.fn();
  }
}

describe("service", () => {
  it("should create service by @halsp/inject", async () => {
    await new Startup()
      .keepThrow()
      .expectInject(TestService2, (service) => {
        expect(service.fn()).toBe(1);
      })
      .test();
  });

  it("should throw error when create service failed", async () => {
    let err = false;
    try {
      await new Startup()
        .keepThrow()
        .expectInject("not-exist", () => {
          //
        })
        .test();
    } catch {
      err = true;
    }
    expect(err).toBeTruthy();
  });
});
