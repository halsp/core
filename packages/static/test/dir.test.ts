import { TestHttpStartup } from "@ipare/testing/dist/http";
import "../src";
import { Request } from "@ipare/core";
import { HttpMethods } from "@ipare/methods";
import path from "path";

describe("dir", () => {
  it("should list dir files when listDir = true", async () => {
    {
      const result = await new TestHttpStartup()
        .setContext(new Request().setMethod(HttpMethods.get))
        .useStatic({
          dir: "test/static",
          listDir: true,
        })
        .run();

      expect(result.status).toBe(200);
      const html = result.body as string;
      expect(
        html.includes(`<title>Files within ${path.sep}</title>`)
      ).toBeTruthy();
    }

    {
      const result = await new TestHttpStartup()
        .setContext(new Request().setMethod(HttpMethods.get))
        .useStatic({
          dir: "test/static",
        })
        .run();

      expect(result.status).toBe(404);
      expect(result.body).toBeUndefined();
    }
  });

  it("should list children dir with folder ..", async () => {
    const result = await new TestHttpStartup()
      .setContext(new Request().setMethod(HttpMethods.get).setPath("dir"))
      .useStatic({
        dir: "test/static",
        listDir: true,
      })
      .run();

    expect(result.status).toBe(200);
    const html = result.body as string;
    expect(
      html.includes(`<title>Files within dir${path.sep}</title>`)
    ).toBeTruthy();
    expect(html.includes(`>..</a>`)).toBeTruthy();
  });
});
