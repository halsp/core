import { Request } from "@ipare/http";
import { TestHttpStartup } from "@ipare/testing";
import "../src";

test("unknown mime", async () => {
  {
    const result = await new TestHttpStartup()
      .setRequest(new Request().setMethod("get").setPath("index.un"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(200);
    expect(result.body).toBe("unknown");
    expect(result.headers["content-type"]).toBe("*/*");
  }
  {
    const result = await new TestHttpStartup()
      .setRequest(new Request().setMethod("get").setPath("not-exist"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        file404: "index.un",
      })
      .run();
    expect(result.status).toBe(404);
    expect(result.body).toBe("unknown");
    expect(result.headers["content-type"]).toBe("*/*");
  }
});

test("single unknown mime", async () => {
  const result = await new TestHttpStartup()
    .setRequest(new Request().setMethod("get").setPath("ind"))
    .useStatic({
      file: "test/static/index.un",
      reqPath: "ind",
      encoding: "utf-8",
    })
    .run();
  expect(result.status).toBe(200);
  expect(result.body).toBe("unknown");
  expect(result.headers["content-type"]).toBe("*/*");
});
