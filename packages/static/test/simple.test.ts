import { TestStartup, SfaRequest } from "sfa";
import "../src";

test("index html", async function () {
  {
    const result = await new TestStartup(new SfaRequest().setMethod("get"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(200);
    expect(result.body).toBe("TEST");
  }
  {
    const result = await new TestStartup(
      new SfaRequest().setMethod("get").setPath("index.html")
    )
      .use(async (ctx, next) => {
        await next();
        expect(ctx.bag<string>("STATIC_FILE")).not.toBeUndefined();
      })
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(200);
    expect(result.body).toBe("TEST");
  }
});

test("default static dir", async function () {
  const result = await new TestStartup(new SfaRequest().setMethod("get"))
    .use(async (ctx, next) => {
      await next();
      expect(ctx.bag<string>("STATIC_FILE")).toBeUndefined();
    })
    .useStatic()
    .run();
  expect(result.status).toBe(404);
});
