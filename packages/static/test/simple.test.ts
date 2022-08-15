import { Request } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../src";
import { FILE_BAG } from "../src/constant";

test("index html", async () => {
  {
    const result = await new TestStartup()
      .setRequest(new Request().setMethod("get"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(200);
    expect(result.body).toBe("TEST");
  }
  {
    const result = await new TestStartup()
      .setRequest(new Request().setMethod("get").setPath("index.html"))
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
    expect(result.body).toBe("TEST");
  }
});

test("default static dir", async () => {
  const result = await new TestStartup()
    .setRequest(new Request().setMethod("get"))
    .use(async (ctx, next) => {
      await next();
      expect(ctx.bag<string>(FILE_BAG)).toBeUndefined();
    })
    .useStatic()
    .run();
  expect(result.status).toBe(404);
});
