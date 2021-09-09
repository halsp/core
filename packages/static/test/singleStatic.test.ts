import { TestStartup, SfaRequest } from "sfa";
import "../src";

test("match", async function () {
  {
    const result = await new TestStartup(
      new SfaRequest().setMethod("get").setPath("ind")
    )
      .use(async (ctx, next) => {
        await next();
        expect(ctx.bag<string>("STATIC_FILE")).not.toBeUndefined();
      })
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
    const result = await new TestStartup(
      new SfaRequest().setMethod("get").setPath("/ind/")
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
    const result = await new TestStartup(
      new SfaRequest().setMethod("get").setPath("ind")
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
  const result = await new TestStartup(
    new SfaRequest().setMethod("get").setPath("ind1")
  )
    .use(async (ctx, next) => {
      await next();
      expect(ctx.bag<string>("STATIC_FILE")).toBeUndefined();
    })
    .useStatic({
      file: "test/static/index.html",
      reqPath: "ind",
      encoding: "utf-8",
    })
    .run();
  expect(result.status).toBe(404);
});

test("not found file", async function () {
  const result = await new TestStartup(
    new SfaRequest().setMethod("get").setPath("ind")
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
  const result = await new TestStartup(
    new SfaRequest().setMethod("get").setPath("sta")
  )
    .useStatic({
      file: "test/static",
      reqPath: "sta",
      encoding: "utf-8",
    })
    .run();
  expect(result.status).toBe(404);
});

test("empty req path", async function () {
  {
    const result = await new TestStartup(
      new SfaRequest().setMethod("get").setPath("")
    )
      .useStatic({
        file: "test/static/index.html",
        reqPath: "",
      })
      .run();
    expect(result.status).toBe(200);
  }

  {
    const result = await new TestStartup(
      new SfaRequest().setMethod("get").setPath("/")
    )
      .useStatic({
        file: "test/static/index.html",
        reqPath: "",
      })
      .run();
    expect(result.status).toBe(200);
  }

  {
    const result = await new TestStartup(
      new SfaRequest().setMethod("get").setPath("ind")
    )
      .useStatic({
        file: "test/static/index.html",
        reqPath: "",
      })
      .run();
    expect(result.status).toBe(404);
  }
});
