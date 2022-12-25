import { Request } from "@ipare/core";
import { TestHttpStartup } from "@ipare/testing/dist/http";
import "../src";
import { FILE_BAG } from "../src/constant";
import { readStream } from "./utils";

describe("index.html", () => {
  it("should return status 404", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("get"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(404);
  });

  it("should match index.html from path", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("get").setPath("index.html"))
      .use(async (ctx, next) => {
        await next();
        expect(ctx.bag<string>(FILE_BAG)).not.toBeUndefined();
      })
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(200);
    expect(await readStream(result.body)).toBe("TEST");
  });

  it("should find index.html when options.useIndex is true", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("get"))
      .use(async (ctx, next) => {
        await next();
        expect(ctx.bag<string>(FILE_BAG)).not.toBeUndefined();
      })
      .useStatic({
        dir: "test/static",
        useIndex: true,
      })
      .run();
    expect(result.status).toBe(200);
    expect(await readStream(result.body)).toBe("TEST");
  });

  it("should find custom index file when options.useIndex is string", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("get"))
      .use(async (ctx, next) => {
        await next();
        expect(ctx.bag<string>(FILE_BAG)).not.toBeUndefined();
      })
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        useIndex: "index.html",
      })
      .run();
    expect(result.status).toBe(200);
    expect(await readStream(result.body)).toBe("TEST");
  });

  it("should match prefix", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("get").setPath(null as any))
      .useStatic({
        dir: "test/static",
        prefix: "static",
      })
      .run();
    expect(result.status).toBe(404);
  });
});

test("default static dir", async () => {
  const result = await new TestHttpStartup()
    .setContext(new Request().setMethod("get"))
    .use(async (ctx, next) => {
      await next();
      expect(ctx.bag<string>(FILE_BAG)).toBeUndefined();
    })
    .useStatic()
    .run();
  expect(result.status).toBe(404);
});
