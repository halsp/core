import "../../src";
import { Request } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../global";

test(`method not allowed`, async () => {
  const result = await new TestStartup(
    new Request().setPath("/restful/1").setMethod("NO")
  )
    .useTestRouter()
    .run();
  expect(result.status).toBe(405);
});
