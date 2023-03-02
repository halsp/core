import "../../src";
import { Request } from "@halsp/common";
import { TestHttpStartup } from "@halsp/testing/dist/http";
import "../utils-http";

test(`method not allowed`, async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setPath("/restful/1").setMethod("NO"))
    .useTestRouter()
    .run();
  expect(result.status).toBe(405);
});
