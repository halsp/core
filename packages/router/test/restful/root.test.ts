import { HttpMethods } from "@halsp/methods";
import { Request, Startup } from "@halsp/core";
import "@halsp/testing";
import "@halsp/http";
import "../../src";
import "../utils";

test("restful root get", async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(
      new Request().setPath("/").setMethod(HttpMethods.get.toUpperCase())
    )
    .useTestRouter()
    .test();
  expect(result.status).toBe(200);
  expect(result.body.method).toBe(HttpMethods.get);
});
