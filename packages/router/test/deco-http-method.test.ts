import { HttpMethod, Request, StatusCodes } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../src";
import "./global";

function runTest(method: string, success: boolean) {
  test(`${method} ${success}`, async () => {
    const res = await new TestStartup(
      new Request().setPath("/decorator/method").setMethod(method)
    )
      .useTestRouter()
      .run();

    if (success) {
      expect(res.body).toBe("method");
    }
    expect(res.status).toBe(success ? 200 : StatusCodes.METHOD_NOT_ALLOWED);
  });
}

runTest(HttpMethod.get, true);
runTest(HttpMethod.head, true);
runTest(HttpMethod.post, true);
runTest(HttpMethod.patch, true);
runTest(HttpMethod.trace, true);
runTest(HttpMethod.options, true);

runTest(HttpMethod.put, false);
runTest(HttpMethod.any, false);

test(`custom url`, async () => {
  const res = await new TestStartup(
    new Request().setPath("/mu").setMethod(HttpMethod.put)
  )
    .useTestRouter()
    .run();

  expect(res.body).toBe("method");
  expect(res.status).toBe(200);
});

test(`base path`, async () => {
  const res = await new TestStartup(
    new Request()
      .setPath("decorator/method-base-path/mup")
      .setMethod(HttpMethod.get)
  )
    .useTestRouter()
    .run();

  expect(res.body).toBe("method");
  expect(res.status).toBe(200);
});
