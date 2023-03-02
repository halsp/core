import "../../src";
import { HttpMethods } from "@halsp/methods";
import { TestHttpStartup } from "@halsp/testing/dist/http";
import "../utils-http";
import { Request } from "@halsp/common";

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
