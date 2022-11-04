import { HttpMethods } from "@ipare/methods";
import { Request } from "@ipare/core";
import { TestHttpStartup } from "@ipare/testing-http";
import "../../src";
import "../global";

test("restful root get", async () => {
  const result = await new TestHttpStartup()
    .setContext(
      new Request().setPath("/").setMethod(HttpMethods.get.toUpperCase())
    )
    .useTestRouter()
    .run();
  expect(result.status).toBe(200);
  expect(result.body.method).toBe(HttpMethods.get);
});
