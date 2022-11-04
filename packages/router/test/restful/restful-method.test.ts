import { HttpMethods } from "@ipare/methods";
import { Request } from "@ipare/core";
import { TestHttpStartup } from "@ipare/testing-http";
import "../../src";
import "../global";

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
    const result = await new TestHttpStartup()
      .setContext(new Request().setPath("/restful").setMethod(method))
      .useTestRouter()
      .run();
    expect(result.status).toBe(200);
    expect(result.body.method).toBe(method);
  });
});
