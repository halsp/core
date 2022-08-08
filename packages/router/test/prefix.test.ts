import { Request } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../src";
import "./global";
import { testDir } from "./global";

test("prefix", async () => {
  const result = await new TestStartup(
    new Request().setPath("/api2/simple/router").setMethod("POST")
  )
    .useTestRouter({
      prefix: "api2",
      dir: testDir,
    })
    .run();
  expect(result.status).toBe(200);
});

test("error prefix", async () => {
  const result = await new TestStartup(
    new Request().setPath("/api2/simple/router").setMethod("POST")
  )
    .useTestRouter({
      prefix: "error",
      dir: testDir,
    })
    .run();
  expect(result.status).toBe(404);
});
