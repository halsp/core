import { Request } from "@ipare/http";
import { TestHttpStartup } from "@ipare/testing";
import "../src";

test("forbidden path", async () => {
  const result = await new TestHttpStartup()
    .setRequest(new Request().setMethod("get").setPath("f/../b"))
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
      file404: "404.html",
    })
    .run();
  expect(result.status).toBe(404);
});
