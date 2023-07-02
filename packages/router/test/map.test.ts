import "@halsp/testing";
import "@halsp/http";
import MapCreater from "../src/map/map-creater";
import "./utils";
import MapParser from "../src/map/map-parser";
import { MapItem } from "../src";
import { Startup } from "@halsp/core";

describe("map", () => {
  it("should throw error when use MapCreater and router dir not exist", async () => {
    expect(() => new MapCreater("not-exist")).toThrowError(
      "The router dir is not exist"
    );
  });

  it("should create router map", async () => {
    const result = await new Startup()
      .useHttp()
      .use(async (ctx, next) => {
        await next();
        expect(ctx.routerMap).not.toBeUndefined();
        expect(ctx.routerMap).toBe(ctx.startup.routerMap);
      })
      .useTestRouter()
      .test();
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

  it("should not find actionMetadata if preset", async () => {
    const result = await new Startup()
      .useHttp()
      .use(async (ctx, next) => {
        Object.defineProperty(ctx, "actionMetadata", {
          get: () =>
            new MapItem({
              path: "Router.ts",
              actionName: "default",
            }),
        });
        await next();
      })
      .useTestRouter()
      .test();
    expect(result.status).toBe(200);
    expect(result.body).toBe("ok");
  });
});
