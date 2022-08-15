import { Request } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../src";

test("null path", async () => {
  {
    const result = await new TestStartup()
      .setRequest(new Request().setMethod("get").setPath(null as any))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(200);
    expect(result.body).toBe("TEST");
  }
  {
    const result = await new TestStartup()
      .setRequest(new Request().setMethod("get").setPath(null as any))
      .useStatic({
        file: "test/static/index.html",
      })
      .run();
    expect(result.status).toBe(404);
  }
});

test("undefined path", async () => {
  const result = await new TestStartup()
    .setRequest(new Request().setMethod("get").setPath(undefined as any))
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
    })
    .run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("TEST");
});

test("prefix", async () => {
  const result = await new TestStartup()
    .setRequest(new Request().setMethod("get").setPath(null as any))
    .useStatic({
      dir: "test/static",
      prefix: "static",
    })
    .run();
  expect(result.status).toBe(404);
});
