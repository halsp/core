import { Request } from "@ipare/core";
import { TestHttpStartup } from "@ipare/testing-http";
import "../src";

test("method", async () => {
  {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("GET"))
      .useStatic({
        dir: "test/static",
        fileIndex: true,
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("POST"))
      .useStatic({
        dir: "test/static",
        method: "GET",
      })
      .run();
    expect(result.status).toBe(404);
  }
  {
    const result = await new TestHttpStartup()
      .useStatic({
        dir: "test/static",
      })
      .run();
    expect(result.status).toBe(404);
  }
});

test("single method", async () => {
  {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("get").setPath("ind"))
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestHttpStartup()
      .setContext(new Request().setPath("ind"))
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
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("put").setPath("ind"))
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
        method: "PUT",
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("PUT"))
      .useStatic({
        dir: "test/static",
        method: "PUT",
        fileIndex: true,
      })
      .run();
    expect(result.status).toBe(200);
  }
});

test("array method", async () => {
  {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("put").setPath("ind"))
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
        method: ["PUT"],
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("PUT"))
      .useStatic({
        dir: "test/static",
        method: ["PUT"],
        fileIndex: true,
      })
      .run();
    expect(result.status).toBe(200);
  }
});

test("any method", async () => {
  {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("PUT"))
      .useStatic({
        dir: "test/static",
        method: ["ANY"],
        fileIndex: true,
      })
      .run();
    expect(result.status).toBe(200);
  }
  {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("PUT"))
      .useStatic({
        dir: "test/static",
        method: "ANY",
        fileIndex: true,
      })
      .run();
    expect(result.status).toBe(200);
  }
});
