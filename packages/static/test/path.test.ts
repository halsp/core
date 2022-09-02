import { Request } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../src";
import { FILE_BAG } from "../src/constant";

describe("index.html", () => {
  it("should return status 404", async () => {
    const result = await new TestStartup()
      .setRequest(new Request().setMethod("get"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
      })
      .run();
    expect(result.status).toBe(404);
  });

  it("should match index.html from path", async () => {
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
  });

  it("should find index.html when options.fileIndex is true", async () => {
    const result = await new TestStartup()
      .setRequest(new Request().setMethod("get"))
      .use(async (ctx, next) => {
        await next();
        expect(ctx.bag<string>(FILE_BAG)).not.toBeUndefined();
      })
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        fileIndex: true,
      })
      .run();
    expect(result.status).toBe(200);
    expect(result.body).toBe("TEST");
  });

  it("should find custom index file when options.fileIndex is string", async () => {
    const result = await new TestStartup()
      .setRequest(new Request().setMethod("get"))
      .use(async (ctx, next) => {
        await next();
        expect(ctx.bag<string>(FILE_BAG)).not.toBeUndefined();
      })
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        fileIndex: "index.html",
      })
      .run();
    expect(result.status).toBe(200);
    expect(result.body).toBe("TEST");
  });

  it("should match prefix", async () => {
    const result = await new TestStartup()
      .setRequest(new Request().setMethod("get").setPath(null as any))
      .useStatic({
        dir: "test/static",
        prefix: "static",
      })
      .run();
    expect(result.status).toBe(404);
  });
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

// test("null path", async () => {
//   {
//     const result = await new TestStartup()
//       .setRequest(new Request().setMethod("get").setPath(null as any))
//       .useStatic({
//         dir: "test/static",
//         encoding: "utf-8",
//       })
//       .run();
//     expect(result.status).toBe(200);
//     expect(result.body).toBe("TEST");
//   }
//   {
//     const result = await new TestStartup()
//       .setRequest(new Request().setMethod("get").setPath(null as any))
//       .useStatic({
//         file: "test/static/index.html",
//       })
//       .run();
//     expect(result.status).toBe(404);
//   }
// });

// test("undefined path", async () => {
//   const result = await new TestStartup()
//     .setRequest(new Request().setMethod("get").setPath(undefined as any))
//     .useStatic({
//       dir: "test/static",
//       encoding: "utf-8",
//     })
//     .run();
//   expect(result.status).toBe(200);
//   expect(result.body).toBe("TEST");
// });
