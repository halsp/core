import { Request } from "@ipare/core";
import { TestHttpStartup } from "@ipare/testing-http";
import "../src";

test("prefix", async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setMethod("get").setPath("static/index.un"))
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
      prefix: "static",
    })
    .run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("unknown");
});

test("prefix with /", async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setMethod("get").setPath("/static/index.un/"))
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
      prefix: "static",
    })
    .run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("unknown");
});

test("prefix not found", async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setMethod("get").setPath("/static/index.un/"))
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
      prefix: "static1",
    })
    .run();
  expect(result.status).toBe(404);
});
