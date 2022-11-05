import { Request } from "@ipare/core";
import { TestHttpStartup } from "@ipare/testing/dist/http";
import "../src";
import "./utils-http";

test("prefix", async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setPath("/api2/simple/router").setMethod("POST"))
    .useTestRouter({
      prefix: "api2",
    })
    .run();
  expect(result.status).toBe(200);
});

test("error prefix", async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setPath("/api2/simple/router").setMethod("POST"))
    .useTestRouter({
      prefix: "error",
    })
    .run();
  expect(result.status).toBe(404);
});
