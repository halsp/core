import { Inject } from "@ipare/inject";
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
  new TestStartup()
    .expectService(TestService2, (service) => {
      expect(service.fn()).toBe(1);
    })
    .it("should create service by @ipare/inject");

  it("should throw error when create service failed", async () => {
    let err = false;
    try {
      await new TestStartup()
        .expectService("not-exist", () => {
          //
        })
        .run();
    } catch {
      err = true;
    }
    expect(err).toBeTruthy();
  });
});
