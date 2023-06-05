import "@halsp/testing";
import "../src";
import { Request, Startup } from "@halsp/core";
import { HttpMethods } from "@halsp/http";
import path from "path";

describe("dir", () => {
  it("should list dir files when listDir = true", async () => {
    {
      const result = await new Startup()
        .useHttp()
        .setContext(new Request().setMethod(HttpMethods.get))
        .useStatic({
          dir: "test/static",
          listDir: true,
        })
        .test();

      expect(result.status).toBe(200);
      const html = result.body as string;
      expect(
        html.includes(`<title>Files within ${path.sep}</title>`)
      ).toBeTruthy();
    }

    {
      const result = await new Startup()
        .useHttp()
        .setContext(new Request().setMethod(HttpMethods.get))
        .useStatic({
          dir: "test/static",
        })
        .test();

      expect(result.status).toBe(404);
    }
  });

  it("should list children dir with folder ..", async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod(HttpMethods.get).setPath("dir"))
      .useStatic({
        dir: "test/static",
        listDir: true,
      })
      .test();

    expect(result.status).toBe(200);
    const html = result.body as string;
    console.log("html", html);
    expect(
      html.includes(`<title>Files within dir${path.sep}</title>`)
    ).toBeTruthy();
    expect(
      html.includes(
        `<a href="/../../static">📂${path.sep}</a><a href="/../../static/dir">dir${path.sep}</a>`
      )
    ).toBeTruthy();
    expect(
      html.includes(`<a href="/." title=".." class="folder ">..</a>`)
    ).toBeTruthy();
    expect(
      html.includes(
        `<a href="/dir/index.html" title="index.html" class="file ">index.html</a>`
      )
    ).toBeTruthy();
  });

  it("should list dir with prefix", async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(
        new Request().setMethod(HttpMethods.get).setPath("static/dir")
      )
      .useStatic({
        dir: "test/static",
        listDir: true,
        prefix: "static",
      })
      .test();

    expect(result.status).toBe(200);
    const html = result.body as string;
    expect(
      html.includes(`<title>Files within dir${path.sep}</title>`)
    ).toBeTruthy();
    expect(
      html.includes(
        `<a href="/../static">📂${path.sep}</a><a href="/../static/dir">dir${path.sep}</a>`
      )
    ).toBeTruthy();
    expect(
      html.includes(`<a href="/static" title=".." class="folder ">..</a>`)
    ).toBeTruthy();
    expect(
      html.includes(
        `<a href="/static/dir/index.html" title="index.html" class="file ">index.html</a>`
      )
    ).toBeTruthy();
  });
});
