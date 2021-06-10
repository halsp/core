import { SimpleStartup, Request } from "sfa";
import "../src";

test("index html", async function () {
  {
    const result = await new SimpleStartup(new Request().setMethod("get"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(200);
    expect(result.body).toBe("TEST");
  }
  {
    const result = await new SimpleStartup(
      new Request().setMethod("get").setPath("index.html")
    )
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(200);
    expect(result.body).toBe("TEST");
  }
});

test("default static dir", async function () {
  const result = await new SimpleStartup(new Request().setMethod("get"))
    .useStatic()
    .run();
  expect(result.status).toBe(404);
});
