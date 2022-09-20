import { TestHttpStartup } from "@ipare/testing";
import MapCreater from "../src/map/map-creater";
import "./global";

test("MapCreater: router dir not exist", async () => {
  expect(() => new MapCreater("not-exist")).toThrowError(
    "The router dir is not exist"
  );
});

test("router map", async () => {
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
