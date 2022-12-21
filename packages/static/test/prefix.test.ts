import { Request } from "@ipare/core";
import { TestHttpStartup } from "@ipare/testing/dist/http";
import "../src";
import { readStream } from "./utils";

describe("prefix", () => {
  it("prefix", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("get").setPath("static/index.un"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        prefix: "static",
      })
      .run();
    expect(result.status).toBe(200);
    expect(await readStream(result.body)).toBe("unknown");
  });

  it("prefix with /", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("get").setPath("/static/index.un/"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        prefix: "static",
      })
      .run();
    expect(result.status).toBe(200);
    expect(await readStream(result.body)).toBe("unknown");
  });

  it("prefix not found", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("get").setPath("/static/index.un/"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        prefix: "static1",
      })
      .run();
    expect(result.status).toBe(404);
  });

  it("prefix not found with fileIndex = true", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod("get").setPath("/static/index.un/"))
      .useStatic({
        dir: "test/static",
        encoding: "utf-8",
        prefix: "static1",
        fileIndex: true,
      })
      .run();
    expect(result.status).toBe(404);
  });
});
