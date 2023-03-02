import { StatusCodes } from "@halsp/http";
import { HttpMethods } from "@halsp/methods";
import { TestHttpStartup } from "@halsp/testing/dist/http";
import "../src";
import "./utils-http";
import { Request } from "@halsp/common";

function runTest(method: string, success: boolean) {
  test(`${method} ${success}`, async () => {
    const res = await new TestHttpStartup()
      .setContext(new Request().setPath("/decorator/method").setMethod(method))
      .useTestRouter()
      .run();

    if (success) {
      expect(res.body).toBe("method");
    }
    expect(res.status).toBe(success ? 200 : StatusCodes.METHOD_NOT_ALLOWED);
  });
}

runTest(HttpMethods.get, true);
runTest(HttpMethods.head, true);
runTest(HttpMethods.post, true);
runTest(HttpMethods.patch, true);
runTest(HttpMethods.trace, true);
runTest(HttpMethods.options, true);
runTest(HttpMethods.move, true);
runTest(HttpMethods.copy, true);
runTest(HttpMethods.link, true);
runTest(HttpMethods.unlink, true);
runTest(HttpMethods.wrapped, true);

runTest(HttpMethods.put, false);
runTest(HttpMethods.any, false);

test(`custom url`, async () => {
  const res = await new TestHttpStartup()
    .setContext(new Request().setPath("/mu").setMethod(HttpMethods.put))
    .useTestRouter()
    .run();

  expect(res.body).toBe("method");
  expect(res.status).toBe(200);
});

test(`base path`, async () => {
  const res = await new TestHttpStartup()
    .setContext(
      new Request()
        .setPath("decorator/method-base-path/mup")
        .setMethod(HttpMethods.get)
    )
    .useTestRouter()
    .run();

  expect(res.body).toBe("method");
  expect(res.status).toBe(200);
});
