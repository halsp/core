import { Request, Startup } from "@halsp/core";
import "@halsp/testing";
import "../src";
import "./utils-http";

test("prefix", async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(new Request().setPath("/api2/simple/router").setMethod("POST"))
    .useTestRouter({
      prefix: "api2",
    })
    .test();
  expect(result.status).toBe(200);
});

test("error prefix", async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(new Request().setPath("/api2/simple/router").setMethod("POST"))
    .useTestRouter({
      prefix: "error",
    })
    .test();
  expect(result.status).toBe(404);
});
