import { Request, Startup } from "@halsp/core";
import { HttpMethods } from "@halsp/http";
import "@halsp/testing";
import "../src";
import { FILE_ERROR_STATUS_BAG, FILE_BAG } from "../src/constant";
import { readStream } from "./utils";

describe("not found", () => {
  it("should return 404 page when use404 = true", async () => {
    {
      const result = await new Startup()
        .useHttp()
        .setContext(new Request().setMethod("get").setPath("not-exist"))
        .use(async (ctx, next) => {
          await next();
          expect(ctx.get<string>(FILE_BAG)).not.toBeUndefined();
          expect(ctx.get<number>(FILE_ERROR_STATUS_BAG)).toBe(404);
        })
        .useStatic({
          dir: "test/static",
          use404: true,
        })
        .test();
      expect(result.status).toBe(404);
      expect(await readStream(result.body)).toBe("404 page");
    }

    {
      const result = await new Startup()
        .useHttp()
        .setContext(new Request().setMethod("get").setPath("not-exist"))
        .useStatic({
          file: "test/static/index.html",
          use404: true,
        })
        .test();
      expect(result.status).toBe(404);
      expect((result.body as string).includes("<span>404</span>")).toBeTruthy();
    }
  });

  it("should return 404 page when use404 = <file path>", async () => {
    {
      const result = await new Startup()
        .useHttp()
        .setContext(new Request().setMethod("get").setPath("not-exist"))
        .useStatic({
          dir: "test/static",
          use404: "404.html",
        })
        .test();
      expect(result.status).toBe(404);
      expect(await readStream(result.body)).toBe("404 page");
    }

    {
      const result = await new Startup()
        .useHttp()
        .setContext(new Request().setMethod("get").setPath("not-exist"))
        .useStatic({
          file: "test/static/index.html",
          use404: "test/static/404.html",
        })
        .test();
      expect(result.status).toBe(404);
      expect(await readStream(result.body)).toBe("404 page");
    }
  });

  it("should be 404 and body is undefined when 404 page is not exist", async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("get").setPath("not-exist"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        use404: "4044.html",
      })
      .test();
    expect(result.status).toBe(404);
    expect((result.body as string).includes("<span>404</span>")).toBeTruthy();
  });

  it("should return default 404 page", async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("get").setPath("not-exist"))
      .useStatic({
        dir: "test/static/dir",
        encoding: "utf-8",
        use404: true,
      })
      .test();
    expect(result.status).toBe(404);
    expect((result.body as string).includes("<span>404</span>")).toBeTruthy();
  });

  it("should be 404 with listDir = true and listDir = true when path is not exist", async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod(HttpMethods.post))
      .useStatic({
        dir: "test/static/not-exist",
        listDir: true,
        use405: true,
      })
      .test();

    expect(result.status).toBe(404);
  });
});
