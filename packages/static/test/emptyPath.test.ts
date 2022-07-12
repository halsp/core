import { TestStartup, Request } from "@ipare/core";
import "../src";

test("null path", async function () {
  {
    const result = await new TestStartup(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new Request().setMethod("get").setPath(null as any)
    )
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(200);
    expect(result.body).toBe("TEST");
  }
  {
    const result = await new TestStartup(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new Request().setMethod("get").setPath(null as any)
    )
      .useStatic({
        file: "test/static/index.html",
      })
      .run();
    expect(result.status).toBe(404);
  }
});

test("undefined path", async function () {
  const result = await new TestStartup(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Request().setMethod("get").setPath(undefined as any)
  )
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
    })
    .run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("TEST");
});

test("prefix", async function () {
  const result = await new TestStartup(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Request().setMethod("get").setPath(null as any)
  )
    .useStatic({
      dir: "test/static",
      prefix: "static",
    })
    .run();
  expect(result.status).toBe(404);
});
