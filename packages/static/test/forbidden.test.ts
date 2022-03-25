import { TestStartup, SfaRequest } from "@sfajs/core";
import "../src";

test("forbidden path", async function () {
  const result = await new TestStartup(
    new SfaRequest().setMethod("get").setPath("f/../b")
  )
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
      file404: "404.html",
    })
    .run();
  expect(result.status).toBe(404);
});
