import { Request } from "@halsp/common";
import { TestHttpStartup } from "@halsp/testing/dist/http";
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
