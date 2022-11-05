import "../../src";
import { Request } from "@ipare/core";
import { TestHttpStartup } from "@ipare/testing/dist/http";
import "../utils-http";

test(`method not allowed`, async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setPath("/restful/1").setMethod("NO"))
    .useTestRouter()
    .run();
  expect(result.status).toBe(405);
});
