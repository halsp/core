import { Request } from "@halsp/common";
import { TestHttpStartup } from "@halsp/testing/dist/http";
import "../src";

test("default req path not found", async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setMethod("get").setPath("ind"))
    .useStatic({
      file: "test/static/index.html",
    })
    .run();
  expect(result.status).toBe(404);
});

test("default req path found", async () => {
  {
    const result = await new TestHttpStartup()
      .setContext(
        new Request().setMethod("get").setPath("test/static/index.html")
      )
      .useStatic({
        file: "test/static/index.html",
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestHttpStartup()
      .setContext(
        new Request().setMethod("get").setPath("test/static/index.html/")
      )
      .useStatic({
        file: "test/static/index.html",
      })
      .run();
    expect(result.status).toBe(200);
  }
});
