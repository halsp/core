import { Request, Startup } from "@halsp/core";
import "@halsp/http";
import "@halsp/testing";
import "../src";

test("default req path not found", async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(new Request().setMethod("get").setPath("ind"))
    .useStatic({
      file: "test/static/index.html",
    })
    .test();
  expect(result.status).toBe(404);
});

test("default req path found", async () => {
  {
    const result = await new Startup()
      .useHttp()
      .setContext(
        new Request().setMethod("get").setPath("test/static/index.html")
      )
      .useStatic({
        file: "test/static/index.html",
      })
      .test();
    expect(result.status).toBe(200);
  }
  {
    const result = await new Startup()
      .useHttp()
      .setContext(
        new Request().setMethod("get").setPath("test/static/index.html/")
      )
      .useStatic({
        file: "test/static/index.html",
      })
      .test();
    expect(result.status).toBe(200);
  }
});
