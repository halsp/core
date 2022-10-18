import { HttpMethod } from "@ipare/http";
import { Request } from "@ipare/core";
import { TestHttpStartup } from "@ipare/testing-http";
import "../../src";
import "../global";

const methods = [
  HttpMethod.get,
  HttpMethod.connect,
  HttpMethod.delete,
  HttpMethod.post,
  HttpMethod.head,
  HttpMethod.options,
  HttpMethod.patch,
  HttpMethod.put,
  HttpMethod.trace,
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
