import { Inject } from "@halsp/inject";
import { TestStartup } from "../src";

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
    await new TestStartup()
      .expectInject(TestService2, (service) => {
        expect(service.fn()).toBe(1);
      })
      .run();
  });

  it("should throw error when create service failed", async () => {
    let err = false;
    try {
      await new TestStartup()
        .expectInject("not-exist", () => {
          //
        })
        .run();
    } catch {
      err = true;
    }
    expect(err).toBeTruthy();
  });
});
