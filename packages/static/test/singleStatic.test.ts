import { SimpleStartup, Request } from "sfa";
import "../src";

test("match", async function () {
  {
    const result = await new SimpleStartup(
      new Request().setMethod("get").setPath("ind")
    )
      .useStatic({
        file: "test/static/index.html",
        reqPath: "ind",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(200);
    expect(result.body).toBe("TEST");
  }
  {
    const result = await new SimpleStartup(
      new Request().setMethod("get").setPath("/ind/")
    )
      .useStatic({
        file: "test/static/index.html",
        reqPath: "/ind/",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(200);
    expect(result.body).toBe("TEST");
  }
  {
    const result = await new SimpleStartup(
      new Request().setMethod("get").setPath("ind")
    )
      .useStatic({
        file: "test/static/index.html",
        reqPath: "/ind/",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(200);
    expect(result.body).toBe("TEST");
  }
});

test("not found path", async function () {
  const result = await new SimpleStartup(
    new Request().setMethod("get").setPath("ind1")
  )
    .useStatic({
      file: "test/static/index.html",
      reqPath: "ind",
      encoding: "utf-8",
    })
    .run();
  expect(result.status).toBe(404);
});

test("not found file", async function () {
  const result = await new SimpleStartup(
    new Request().setMethod("get").setPath("ind")
  )
    .useStatic({
      file: "test/static/index1.html",
      reqPath: "ind",
      encoding: "utf-8",
    })
    .run();
  expect(result.status).toBe(404);
});

test("found dir instead of file", async function () {
  const result = await new SimpleStartup(
    new Request().setMethod("get").setPath("sta")
  )
    .useStatic({
      file: "test/static",
      reqPath: "sta",
      encoding: "utf-8",
    })
    .run();
  expect(result.status).toBe(500);
  expect(result.body).toEqual({
    message: "illegal operation on a directory, read",
  });
});
