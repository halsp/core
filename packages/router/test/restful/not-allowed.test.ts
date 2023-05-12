import "../../src";
import { Request, Startup } from "@halsp/core";
import "@halsp/testing";
import "../utils-http";

test(`method not allowed`, async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(new Request().setPath("/restful/1").setMethod("NO"))
    .useTestRouter()
    .test();
  expect(result.status).toBe(405);
});
