import "../../src";
import { TestStartup, Request } from "@sfajs/core";
import "../global";

test(`method not allowed`, async () => {
  const result = await new TestStartup(
    new Request().setPath("/restful/1").setMethod("NO")
  )
    .useTestRouter()
    .run();
  expect(result.status).toBe(405);
});
