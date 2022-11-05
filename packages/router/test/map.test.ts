import { TestHttpStartup } from "@ipare/testing/dist/http";
import MapCreater from "../src/map/map-creater";
import "./utils-http";
import MapParser from "../src/map/map-parser";

describe("map", () => {
  it("should throw error when use MapCreater and router dir not exist", async () => {
    expect(() => new MapCreater("not-exist")).toThrowError(
      "The router dir is not exist"
    );
  });

  it("should create router map", async () => {
    const result = await new TestHttpStartup()
      .use(async (ctx, next) => {
        await next();
        expect(ctx.routerMap).not.toBeUndefined();
        expect(ctx.routerMap).toBe(
          (ctx.startup as any as TestHttpStartup).routerMap
        );
      })
      .useTestRouter()
      .run();
    expect(result.status).toBe(405);
  });

  it("should throw error when use MapParser and router dir not exist", async () => {
    expect(
      () =>
        new MapParser({
          dir: "test/not-exist",
        })
    ).toThrowError("The router dir is not exist");
  });
});
