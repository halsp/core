import { HttpMethod, SfaRequest, StatusCodes, TestStartup } from "@sfajs/core";
import { routerCfg } from "./global";
import "../src";

function runTest(method: string, success: boolean) {
  test(`${method} ${success}`, async function () {
    const res = await new TestStartup(
      new SfaRequest().setPath("/decorator/method").setMethod(method)
    )
      .useRouter(routerCfg)
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

test(`custom url`, async function () {
  const res = await new TestStartup(
    new SfaRequest().setPath("/mu").setMethod(HttpMethod.put)
  )
    .useRouter(routerCfg)
    .run();

  expect(res.body).toBe("method");
  expect(res.status).toBe(200);
});

test(`custom`, async function () {
  HttpMethod.custom.push("CUSTOM_DEC");
  const res = await new TestStartup(
    new SfaRequest().setPath("/muc").setMethod("CUSTOM_DEC")
  )
    .useRouter(routerCfg)
    .run();

  expect(res.body).toBe("method");
  expect(res.status).toBe(200);
});

test(`base path`, async function () {
  const res = await new TestStartup(
    new SfaRequest()
      .setPath("decorator/method-base-path/mup")
      .setMethod(HttpMethod.get)
  )
    .useRouter(routerCfg)
    .run();

  expect(res.body).toBe("method");
  expect(res.status).toBe(200);
});
