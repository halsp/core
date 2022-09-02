import { Request, HttpMethod } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../../src";
import "../global";

const methods = [
  HttpMethod.get,
  HttpMethod.connect,
  HttpMethod.delete,
  HttpMethod.post,
  HttpMethod.options,
  HttpMethod.patch,
  HttpMethod.put,
  HttpMethod.trace,
];

methods.forEach((method) => {
  test(`${method} restful test`, async () => {
    const result = await new TestStartup()
      .setRequest(new Request().setPath("/restful").setMethod(method))
      .useTestRouter()
      .run();
    expect(result.status).toBe(200);
    expect(result.body.method).toBe(method);
  });
});
