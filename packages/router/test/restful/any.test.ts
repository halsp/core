import "../../src";
import { HttpMethods } from "@ipare/methods";
import { TestHttpStartup } from "@ipare/testing/dist/http";
import "../utils-http";
import { Request } from "@ipare/core";

const methods = ["test", "aaa", "NO"];

methods.forEach((method) => {
  test(`${method} -> any restful test`, async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setPath("/restful").setMethod(method))
      .useTestRouter()
      .run();

    expect(result.status).toBe(200);
    expect(!!result.body.method).toBe(true);
    expect(result.body.method).toBe(HttpMethods.any);
  });
});
