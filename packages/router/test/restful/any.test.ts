import "../../src";
import { HttpMethods } from "@halsp/methods";
import "@halsp/testing";
import "@halsp/http";
import "../utils";
import { Request, Startup } from "@halsp/core";

const methods = ["test", "aaa", "NO"];

methods.forEach((method) => {
  test(`${method} -> any restful test`, async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("/restful").setMethod(method))
      .useTestRouter()
      .test();

    expect(result.status).toBe(200);
    expect(!!result.body.method).toBe(true);
    expect(result.body.method).toBe(HttpMethods.any);
  });
});
