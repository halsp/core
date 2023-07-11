import "@halsp/testing";
import "@halsp/http";
import MapCreater from "../src/map/map-creater";
import "./utils";
import MapParser from "../src/map/map-parser";
import { MapItem } from "../src";
import { Request, Startup } from "@halsp/core";
import { runin } from "@halsp/testing";
import { HALSP_ROUTER_DIR } from "../src/constant";

describe("map", () => {
  it("should be empty when use MapCreater and router dir not exist", async () => {
    const map = new MapCreater("not-exist").create();
    expect(map).toEqual([]);
  });

  it("should be empty when use MapParser and router dir not exist", async () => {
    const map = new MapParser({
      dir: "test/not-exist",
    }).getMap();
    expect(map).toEqual([]);
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

describe("default actions", () => {
  it("should find actions dir", async () => {
    await runin("test/def-actions", async () => {
      delete process.env[HALSP_ROUTER_DIR];

      const result = await new Startup()
        .useHttp()
        .setContext(new Request().setPath("").setMethod("GET"))
        .useRouter()
        .test();

      expect(result.body).toEqual({
        defaultActions: true,
      });
      expect(result.status).toBe(200);
    });
  });
});
