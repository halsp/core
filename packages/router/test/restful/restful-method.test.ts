import { HttpMethods } from "@halsp/methods";
import { Request, Startup } from "@halsp/core";
import "@halsp/testing";
import "@halsp/http";
import "../../src";
import "../utils";

const methods = [
  HttpMethods.get,
  HttpMethods.connect,
  HttpMethods.delete,
  HttpMethods.post,
  HttpMethods.head,
  HttpMethods.options,
  HttpMethods.patch,
  HttpMethods.put,
  HttpMethods.trace,
];

methods.forEach((method) => {
  test(`${method} restful test`, async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setPath("/restful").setMethod(method))
      .useTestRouter()
      .test();
    expect(result.status).toBe(200);
    expect(result.body.method).toBe(method);
  });
});
