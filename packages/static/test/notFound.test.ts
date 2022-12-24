import { Request } from "@ipare/core";
import { HttpMethods } from "@ipare/methods";
import { TestHttpStartup } from "@ipare/testing/dist/http";
import "../src";
import { FILE_ERROR_STATUS_BAG, FILE_BAG } from "../src/constant";
import { readStream } from "./utils";

describe("not found", () => {
  it("should set status = 404 when then path is not exist", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("get").setPath("not-exist"))
      .use(async (ctx, next) => {
        await next();
      })
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(404);
  });

  it("should return 404 page when file404 = true", async () => {
    {
      const result = await new TestHttpStartup()
        .setContext(new Request().setMethod("get").setPath("not-exist"))
        .use(async (ctx, next) => {
          await next();
          expect(ctx.bag<string>(FILE_BAG)).not.toBeUndefined();
          expect(ctx.bag<number>(FILE_ERROR_STATUS_BAG)).toBe(404);
        })
        .useStatic({
          dir: "test/static",
          file404: true,
        })
        .run();
      expect(result.status).toBe(404);
      expect(await readStream(result.body)).toBe("404 page");
    }

    {
      const result = await new TestHttpStartup()
        .setContext(new Request().setMethod("get").setPath("not-exist"))
        .useStatic({
          file: "test/static/index.html",
          file404: true,
        })
        .run();
      expect(result.status).toBe(404);
      expect((result.body as string).includes("<span>404</span>")).toBeTruthy();
    }
  });

  it("should return 404 page when file404 = <file path>", async () => {
    {
      const result = await new TestHttpStartup()
        .setContext(new Request().setMethod("get").setPath("not-exist"))
        .useStatic({
          dir: "test/static",
          file404: "404.html",
        })
        .run();
      expect(result.status).toBe(404);
      expect(await readStream(result.body)).toBe("404 page");
    }

    {
      const result = await new TestHttpStartup()
        .setContext(new Request().setMethod("get").setPath("not-exist"))
        .useStatic({
          file: "test/static/index.html",
          file404: "test/static/404.html",
        })
        .run();
      expect(result.status).toBe(404);
      expect(await readStream(result.body)).toBe("404 page");
    }
  });

  it("should be 404 and body is undefined when 404 page is not exist", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("get").setPath("not-exist"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        file404: "4044.html",
      })
      .run();
    expect(result.status).toBe(404);
    expect((result.body as string).includes("<span>404</span>")).toBeTruthy();
  });

  it("should return default 404 page", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("get").setPath("not-exist"))
      .useStatic({
        dir: "test/static/dir",
        encoding: "utf-8",
        file404: true,
      })
      .run();
    expect(result.status).toBe(404);
    expect((result.body as string).includes("<span>404</span>")).toBeTruthy();
  });

  it("should be 404 with listDir = true and listDir = true when path is not exist", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod(HttpMethods.post))
      .useStatic({
        dir: "test/static/not-exist",
        listDir: true,
        file405: true,
      })
      .run();

    expect(result.status).toBe(404);
  });
});
