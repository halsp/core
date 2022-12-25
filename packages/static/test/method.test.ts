import { Request } from "@ipare/core";
import { HttpMethods } from "@ipare/methods";
import { TestHttpStartup } from "@ipare/testing/dist/http";
import "../src";
import { readStream } from "./utils";

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

  it("should be 404 when method is POST and file405 is undefined", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod(HttpMethods.post))
      .useStatic({
        dir: "test/static",
        fileIndex: true,
        method: HttpMethods.get,
      })
      .run();
    expect(result.status).toBe(404);
  });

  it("should be 200 and ignore file405 when path exist", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod(HttpMethods.get))
      .useStatic({
        dir: "test/static",
        fileIndex: true,
        method: HttpMethods.get,
        file405: true,
      })
      .run();
    expect(result.status).toBe(200);
  });

  it("should return default 405.html when method is POST and use405 is true", async () => {
    {
      const result = await new TestHttpStartup()
        .setContext(
          new Request().setMethod(HttpMethods.post).setPath("index.html")
        )
        .useStatic({
          dir: "test/static/dir",
          method: HttpMethods.get,
          file405: true,
        })
        .run();
      expect(result.status).toBe(405);
      expect((result.body as string).includes("<span>405</span>")).toBeTruthy();
    }

    {
      const result = await new TestHttpStartup()
        .setContext(new Request().setMethod(HttpMethods.post).setPath("index"))
        .useStatic({
          file: "test/static/index.html",
          reqPath: "index",
          method: HttpMethods.get,
          file405: true,
        })
        .run();
      expect(result.status).toBe(405);
      expect((result.body as string).includes("<span>405</span>")).toBeTruthy();
    }

    {
      const result = await new TestHttpStartup()
        .setContext(new Request().setMethod(HttpMethods.post).setPath("index"))
        .useStatic({
          file: "test/static/index.html",
          reqPath: "index",
          method: HttpMethods.get,
        })
        .run();
      expect(result.status).toBe(404);
    }
  });

  it("should return 405.html in dir when method is POST and use405 is true", async () => {
    const result = await new TestHttpStartup()
      .setContext(
        new Request().setMethod(HttpMethods.post).setPath("index.html")
      )
      .useStatic({
        dir: "test/static",
        method: HttpMethods.get,
        file405: true,
      })
      .run();
    expect(result.status).toBe(405);
    expect(await readStream(result.body)).toBe("405 page");
  });

  it("should use custom 405 page", async () => {
    {
      const result = await new TestHttpStartup()
        .setContext(
          new Request().setMethod(HttpMethods.post).setPath("index.html")
        )
        .useStatic({
          dir: "test/static/dir",
          method: HttpMethods.get,
          file405: "../405.html",
        })
        .run();
      expect(result.status).toBe(405);
      expect(await readStream(result.body)).toBe("405 page");
    }

    {
      const result = await new TestHttpStartup()
        .setContext(new Request().setMethod(HttpMethods.post).setPath("index"))
        .useStatic({
          file: "test/static/index.html",
          reqPath: "index",
          method: HttpMethods.get,
          file405: "test/static/405.html",
        })
        .run();
      expect(result.status).toBe(405);
      expect(await readStream(result.body)).toBe("405 page");
    }
  });

  it("should be 405 when method is POST and use405 is true with fileIndex = true", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod(HttpMethods.post))
      .useStatic({
        dir: "test/static",
        method: HttpMethods.get,
        file405: true,
        fileIndex: true,
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
        file405: true,
      })
      .run();
    expect(result.status).toBe(405);
  });

  it("should be 404 when file is not exist and use405 is true", async () => {
    {
      const result = await new TestHttpStartup()
        .setContext(new Request().setMethod(HttpMethods.post))
        .useStatic({
          dir: "test/static",
          method: HttpMethods.get,
          file405: true,
        })
        .run();
      expect(result.status).toBe(404);
    }
    {
      const result = await new TestHttpStartup()
        .setContext(new Request().setMethod(HttpMethods.post))
        .useStatic({
          file: "test/static/not-exist",
          method: HttpMethods.get,
          file405: true,
        })
        .run();
      expect(result.status).toBe(404);
    }
  });

  it("should be 405 when file is not exist and generic405 is true", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod(HttpMethods.post))
      .useStatic({
        dir: "test/static",
        method: HttpMethods.get,
        file405: true,
        generic405: true,
      })
      .run();
    expect(result.status).toBe(405);
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
        reqPath: ["ind"],
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
