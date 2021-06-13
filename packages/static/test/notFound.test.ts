import { TestStartup, Request } from "sfa";
import "../src";

test("not found", async function () {
  const result = await new TestStartup(
    new Request().setMethod("get").setPath("not-exist")
  )
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
    })
    .run();
  expect(result.status).toBe(404);
});

test("404 page", async function () {
  {
    const result = await new TestStartup(
      new Request().setMethod("get").setPath("not-exist")
    )
      .use(async (ctx, next) => {
        await next();
        expect(ctx.bag<string>("STATIC_FILE")).not.toBeUndefined();
        expect(ctx.bag<boolean>("STATIC_FILE_404")).toBeTruthy();
      })
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        file404: true,
      })
      .run();
    expect(result.status).toBe(404);
    expect(result.body).toBe("404 page");
  }
  {
    const result = await new TestStartup(
      new Request().setMethod("get").setPath("not-exist")
    )
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        file404: "404.html",
      })
      .run();
    expect(result.status).toBe(404);
    expect(result.body).toBe("404 page");
  }
});

test("404 page not found", async function () {
  const result = await new TestStartup(
    new Request().setMethod("get").setPath("not-exist")
  )
    .useStatic({
      dir: "test/static",
      encoding: "utf-8",
      file404: "4044.html",
    })
    .run();
  expect(result.status).toBe(404);
  expect(result.body).toBe(undefined);
});
