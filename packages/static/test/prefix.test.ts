import { SimpleStartup, Request } from "sfa";
import "../src";

test("prefix", async function () {
  const result = await new SimpleStartup(
    new Request().setMethod("get").setPath("static/index.un")
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
  const result = await new SimpleStartup(
    new Request().setMethod("get").setPath("/static/index.un/")
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
  const result = await new SimpleStartup(
    new Request().setMethod("get").setPath("/static/index.un/")
  )
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
      prefix: "static1",
    })
    .run();
  expect(result.status).toBe(404);
});
