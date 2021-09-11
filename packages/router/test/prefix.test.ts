import { TestStartup, SfaRequest } from "sfa";
import "./UseTest";
import "../src";

test("prefix", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/api2/simple/router").setMethod("POST")
  )
    .useTest({ prefix: "api2" })
    .useRouter()
    .run();
  expect(result.status).toBe(200);
});

test("error prefix", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/api2/simple/router").setMethod("POST")
  )
    .useTest({ prefix: "error" })
    .useRouter()
    .run();
  expect(result.status).toBe(404);
});
