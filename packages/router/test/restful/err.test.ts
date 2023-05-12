import "../../src";
import { HttpMethods } from "@halsp/methods";
import { Request, Startup } from "@halsp/core";
import "@halsp/testing";
import "../utils-http";

test(`action name error`, async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(new Request().setPath("/err").setMethod(HttpMethods.post))
    .useTestRouter()
    .test();

  expect(result.status).toBe(405);
});

test(`without method`, async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(new Request().setPath("/restful").setMethod(""))
    .useTestRouter()
    .test();

  expect(result.status).toBe(200);
  expect(result.body).toEqual({
    method: "ANY",
  });
});
