import "../../src";
import { TestStartup, SfaRequest } from "@sfajs/core";
import "../global";

test(`method not allowed`, async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("/restful/1").setMethod("NO")
  )
    .useTestRouter()
    .run();
  expect(result.status).toBe(405);
});
