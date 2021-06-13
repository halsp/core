import { TestStartup, Request } from "sfa";
import "../src";

test("forbidden path", async function () {
  const result = await new TestStartup(
    new Request().setMethod("get").setPath("f/../b")
  )
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
      file404: "404.html",
    })
    .run();
  expect(result.status).toBe(404);
});
