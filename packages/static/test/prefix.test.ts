import { TestStartup, SfaRequest } from "@sfajs/core";
import "../src";

test("prefix", async function () {
  const result = await new TestStartup(
    new SfaRequest().setMethod("get").setPath("static/index.un")
  )
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
      prefix: "static",
    })
    .run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("unknown");
});

test("prefix with /", async function () {
  const result = await new TestStartup(
    new SfaRequest().setMethod("get").setPath("/static/index.un/")
  )
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
      prefix: "static",
    })
    .run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("unknown");
});

test("prefix not found", async function () {
  const result = await new TestStartup(
    new SfaRequest().setMethod("get").setPath("/static/index.un/")
  )
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
      prefix: "static1",
    })
    .run();
  expect(result.status).toBe(404);
});
