import { TestStartup, SfaRequest } from "sfa";
import "./UseTest";
import "../src";

test("prefix", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/api2/simple/router").setMethod("POST")
  )
    .useTest({ dir: "test/controllers", prefix: "api2" })
    .useRouter()
    .run();
  expect(result.status).toBe(200);
});

test("error prefix", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/api2/simple/router").setMethod("POST")
  )
    .useTest({ dir: "test/controllers", prefix: "error" })
    .useRouter()
    .run();
  expect(result.status).toBe(404);
});
