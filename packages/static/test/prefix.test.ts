import { Request, Startup } from "@halsp/core";
import "@halsp/http";
import "@halsp/testing";
import "../src";
import { readStream } from "./utils";

describe("prefix", () => {
  it("prefix", async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("get").setPath("static/index.un"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        prefix: "static",
      })
      .test();
    expect(result.status).toBe(200);
    expect(await readStream(result.body)).toBe("unknown");
  });

  it("prefix with /", async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("get").setPath("/static/index.un/"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        prefix: "static",
      })
      .test();
    expect(result.status).toBe(200);
    expect(await readStream(result.body)).toBe("unknown");
  });

  it("prefix not found", async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("get").setPath("/static/index.un/"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        prefix: "static1",
      })
      .test();
    expect(result.status).toBe(404);
  });

  it("prefix not found with useIndex = true", async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("get").setPath("/static/index.un/"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        prefix: "static1",
        useIndex: true,
      })
      .test();
    expect(result.status).toBe(404);
  });
});
