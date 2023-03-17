import "../../src";
import { HttpMethods } from "@halsp/methods";
import { Request } from "@halsp/core";
import { TestHttpStartup } from "@halsp/testing/dist/http";
import "../utils-http";

test(`action name error`, async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setPath("/err").setMethod(HttpMethods.post))
    .useTestRouter()
    .run();

  expect(result.status).toBe(405);
});

test(`without method`, async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setPath("/restful").setMethod(""))
    .useTestRouter()
    .run();

  expect(result.status).toBe(200);
  expect(result.body).toEqual({
    method: "ANY",
  });
});
