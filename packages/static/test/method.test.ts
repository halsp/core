import { Request } from "@ipare/core";
import { HttpMethods } from "@ipare/methods";
import { TestHttpStartup } from "@ipare/testing/dist/http";
import "../src";

describe("method", () => {
  it("should match with GET", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod(HttpMethods.get))
      .useStatic({
        dir: "test/static",
        fileIndex: true,
      })
      .run();
    expect(result.status).toBe(200);
  });

  it("should be 404 when method is POST", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod(HttpMethods.post))
      .useStatic({
        dir: "test/static",
        method: HttpMethods.get,
      })
      .run();
    expect(result.status).toBe(404);
  });

  it("should be 405 when method is POST and use405 is true", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod(HttpMethods.post))
      .useStatic({
        dir: "test/static",
        method: HttpMethods.get,
        fileIndex: true,
        use405: true,
      })
      .run();
    expect(result.status).toBe(405);
  });

  it("should be 405 when method is POST and use405 is true with single file", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod(HttpMethods.post).setPath("ind"))
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
        method: HttpMethods.get,
        use405: true,
      })
      .run();
    expect(result.status).toBe(405);
  });

  it("should be 404 when file is not exist and use405 is true", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod(HttpMethods.post))
      .useStatic({
        dir: "test/static",
        method: HttpMethods.get,
        use405: true,
      })
      .run();
    expect(result.status).toBe(404);
  });

  it("should match with custom methods", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("PUT"))
      .useStatic({
        dir: "test/static",
        method: "PUT",
        fileIndex: true,
      })
      .run();
    expect(result.status).toBe(200);
  });

  it("should match with custom methods with reqPath", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("put").setPath("ind"))
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
        method: "PUT",
      })
      .run();
    expect(result.status).toBe(200);
  });

  it("should match with array methods", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("PUT"))
      .useStatic({
        dir: "test/static",
        method: ["PUT"],
        fileIndex: true,
      })
      .run();
    expect(result.status).toBe(200);
  });

  it("should match with array methods with reqPath", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("put").setPath("ind"))
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
        method: ["PUT"],
      })
      .run();
    expect(result.status).toBe(200);
  });

  it("should match with any methods", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("PUT"))
      .useStatic({
        dir: "test/static",
        method: "ANY",
        fileIndex: true,
      })
      .run();
    expect(result.status).toBe(200);
  });
});
