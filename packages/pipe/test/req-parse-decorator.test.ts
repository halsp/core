import { Middleware, ReadonlyDict, TestStartup } from "@sfajs/core";
import "../src";
import { Header, ReqParse } from "../src";

class TestService extends Object {
  invoke() {
    return TestService.name;
  }
}

class TestMiddleware extends Middleware {
  @Header
  private readonly header!: ReadonlyDict;
  @ReqParse
  private readonly service1!: TestService;
  @ReqParse
  private readonly service2!: TestService;

  async invoke(): Promise<void> {
    this.ok({
      header: this.header,
      service1: this.service1.invoke(),
      service2: this.service2.invoke(),
    });
  }
}

test("ReqParse Decorator", async function () {
  const res = await new TestStartup().useReqDeco().add(TestMiddleware).run();
  expect(res.body).toEqual({
    header: {},
    service1: TestService.name,
    service2: TestService.name,
  });
  expect(res.status).toBe(200);
});
