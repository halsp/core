import { TestStartup, Request } from "@ipare/core";
import "../src";

test("method", async () => {
  {
    const result = await new TestStartup(new Request().setMethod("GET"))
      .useStatic({
        dir: "test/static",
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestStartup(new Request().setMethod("POST"))
      .useStatic({
        dir: "test/static",
        method: "GET",
      })
      .run();
    expect(result.status).toBe(404);
  }
  {
    const result = await new TestStartup(new Request())
      .useStatic({
        dir: "test/static",
      })
      .run();
    expect(result.status).toBe(404);
  }
});

test("single method", async () => {
  {
    const result = await new TestStartup(
      new Request().setMethod("get").setPath("ind")
    )
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestStartup(new Request().setPath("ind"))
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
      })
      .run();
    expect(result.status).toBe(404);
  }
});

test("custom method", async () => {
  {
    const result = await new TestStartup(
      new Request().setMethod("head").setPath("ind")
    )
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
        method: "HEAD",
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestStartup(new Request().setMethod("HEAD"))
      .useStatic({
        dir: "test/static",
        method: "HEAD",
      })
      .run();
    expect(result.status).toBe(200);
  }
});

test("array method", async () => {
  {
    const result = await new TestStartup(
      new Request().setMethod("head").setPath("ind")
    )
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
        method: ["HEAD"],
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestStartup(new Request().setMethod("HEAD"))
      .useStatic({
        dir: "test/static",
        method: ["HEAD"],
      })
      .run();
    expect(result.status).toBe(200);
  }
});

test("any method", async () => {
  {
    const result = await new TestStartup(new Request().setMethod("HEAD"))
      .useStatic({
        dir: "test/static",
        method: ["ANY"],
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestStartup(new Request().setMethod("HEAD"))
      .useStatic({
        dir: "test/static",
        method: "ANY",
      })
      .run();
    expect(result.status).toBe(200);
  }
});
