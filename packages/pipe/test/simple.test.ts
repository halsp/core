import "@halsp/http";
import "@halsp/testing";
import "@halsp/inject";
import "../src";
import { expectBody, getTestRequest, TestMiddleware } from "./TestMiddleware";
import { Startup } from "@halsp/core";

function runTest(isConstructor: boolean) {
  test("simple test", async () => {
    const startup = new Startup()
      .useHttp()
      .setContext(getTestRequest())
      .useInject();
    if (isConstructor) {
      startup.add(TestMiddleware);
    } else {
      startup.add(new TestMiddleware());
    }

    const res = await startup.test();
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expectBody);
  });
}

runTest(false);
runTest(true);
