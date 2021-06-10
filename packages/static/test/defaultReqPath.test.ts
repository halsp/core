import { SimpleStartup, Request } from "sfa";
import "../src";

test("null path", async function () {
  const result = await new SimpleStartup(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Request().setMethod("get").setPath("ind")
  )
    .useStatic({
      file: "test/static/index.html",
    })
    .run();
  expect(result.status).toBe(200);
});
