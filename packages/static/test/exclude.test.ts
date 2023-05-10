import "@halsp/http";
import "@halsp/testing";
import { Request, Startup } from "@halsp/core";
import "../src";

describe("exclude", () => {
  it("should exclude with file path", async () => {
    async function runTest(exclude: boolean) {
      const result = await new Startup()
        .useHttp()
        .setContext(new Request().setMethod("get").setPath("dir/index.html"))
        .useStatic({
          dir: "test/static",
          encoding: "utf-8",
          exclude: exclude ? "dir/index.html" : undefined,
        })
        .test();

      expect(result.status).toBe(exclude ? 404 : 200);
    }
    await runTest(true);
    await runTest(false);
  });

  it("should exclude with dir path", async () => {
    async function runTest(exclude: boolean) {
      const result = await new Startup()
        .useHttp()
        .setContext(new Request().setMethod("get").setPath("dir/index.html"))
        .useStatic({
          dir: "test/static",
          encoding: "utf-8",
          exclude: exclude ? ["dir"] : undefined,
        })
        .test();

      expect(result.status).toBe(exclude ? 404 : 200);
    }
    await runTest(true);
    await runTest(false);
  });

  it("should exclude with glob array", async () => {
    async function runTest(exclude: boolean) {
      const result = await new Startup()
        .useHttp()
        .setContext(new Request().setMethod("get").setPath("dir/index.html"))
        .useStatic({
          dir: "test/static",
          encoding: "utf-8",
          exclude: exclude ? ["dir/*.html"] : undefined,
        })
        .test();

      expect(result.status).toBe(exclude ? 404 : 200);
    }
    await runTest(true);
    await runTest(false);
  });
});
