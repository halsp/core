import { Request, Startup } from "@halsp/core";
import "@halsp/http";
import "@halsp/testing";
import "../src";
import { FILE_BAG } from "../src/constant";
import { readStream } from "./utils";

describe("single file", () => {
  it("should match index file when set reqPath option", async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("get").setPath("ind"))
      .use(async (ctx, next) => {
        await next();
        expect(ctx.get<string>(FILE_BAG)).not.toBeUndefined();
      })
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
        encoding: "utf-8",
      })
      .test();
    expect(result.status).toBe(200);
    expect(await readStream(result.body)).toBe("TEST");
  });

  it("should match index when reqPath startsWith /", async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("get").setPath("ind"))
      .useStatic({
        file: "test/static/index.html",
        reqPath: "/ind/",
        encoding: "utf-8",
      })
      .test();
    expect(result.status).toBe(200);
    expect(await readStream(result.body)).toBe("TEST");
  });

  it("should match index when reqPath and path startsWith /", async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("get").setPath("/ind/"))
      .useStatic({
        file: "test/static/index.html",
        reqPath: "/ind/",
        encoding: "utf-8",
      })
      .test();
    expect(result.status).toBe(200);
    expect(await readStream(result.body)).toBe("TEST");
  });
});

test("not found path", async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(new Request().setMethod("get").setPath("ind1"))
    .use(async (ctx, next) => {
      await next();
      expect(ctx.get<string>(FILE_BAG)).toBeUndefined();
    })
    .useStatic({
      file: "test/static/index.html",
      reqPath: "ind",
      encoding: "utf-8",
    })
    .test();
  expect(result.status).toBe(404);
});

test("not found file", async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(new Request().setMethod("get").setPath("ind"))
    .useStatic({
      file: "test/static/index1.html",
      reqPath: "ind",
      encoding: "utf-8",
    })
    .test();
  expect(result.status).toBe(404);
});

test("found dir instead of file", async () => {
  const result = await new Startup()
    .useHttp()
    .setContext(new Request().setMethod("get").setPath("sta"))
    .useStatic({
      file: "test/static",
      reqPath: "sta",
      encoding: "utf-8",
    })
    .test();
  expect(result.status).toBe(404);
});

test("empty req path", async () => {
  {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("get").setPath(""))
      .useStatic({
        file: "test/static/index.html",
        reqPath: "",
      })
      .test();
    expect(result.status).toBe(200);
  }

  {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("get").setPath("/"))
      .useStatic({
        file: "test/static/index.html",
        reqPath: "",
      })
      .test();
    expect(result.status).toBe(200);
  }

  {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("get").setPath("ind"))
      .useStatic({
        file: "test/static/index.html",
        reqPath: "",
      })
      .test();
    expect(result.status).toBe(404);
  }
});
