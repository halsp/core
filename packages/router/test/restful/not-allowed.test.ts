import "../../src";
import { Request } from "@ipare/http";
import { TestHttpStartup } from "@ipare/testing";
import "../global";

test(`method not allowed`, async () => {
  const result = await new TestHttpStartup()
    .setRequest(new Request().setPath("/restful/1").setMethod("NO"))
    .useTestRouter()
    .run();
  expect(result.status).toBe(405);
});
