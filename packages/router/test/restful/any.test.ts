import "../../src";
import { HttpMethod } from "@ipare/http";
import { TestHttpStartup } from "@ipare/testing-http";
import "../global";
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
    expect(result.body.method).toBe(HttpMethod.any);
  });
});
