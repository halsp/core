import { SfaRequest, TestStartup } from "@sfajs/core";
import "../src";
import Auth from "./mva/Auth";
import { runMva } from "./global";

test("403", async function () {
  await runMva(async () => {
    const res = await new TestStartup(
      new SfaRequest()
        .setPath("user/test1@hal.wang")
        .setMethod("GET")
        .setHeader("password", "test2password")
    )
      .useMva({
        codes: [{ code: 403 }],
        routerConfig: {
          onParserAdded: (startup) => {
            startup.add(() => new Auth());
          },
        },
      })
      .run();

    expect(res.status).toBe(403);
    expect(res.body).toBe("<p>403</p>");
  });
});

test("404", async function () {
  await runMva(async () => {
    const res = await new TestStartup(
      new SfaRequest().setPath("not-exist").setMethod("GET")
    )
      .useMva({
        codes: [404],
      })
      .run();

    expect(res.status).toBe(404);
    expect(res.getHeader("content-type")).toBe("text/html");
    expect(res.body).toBe("<p>404</p>");
  });
});

test("replace", async function () {
  await runMva(async () => {
    const res = await new TestStartup(
      new SfaRequest().setPath("not-exist").setMethod("GET")
    )
      .useMva({
        codes: [{ code: 404, replace: 204 }],
      })
      .run();

    expect(res.status).toBe(204);
    expect(res.getHeader("content-type")).toBe("text/html");
    expect(res.body).toBe("<p>404</p>");
  });
});

test("404", async function () {
  await runMva(async () => {
    const res = await new TestStartup(
      new SfaRequest().setPath("not-exist").setMethod("GET")
    )
      .useMva()
      .run();

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      message: "Can't find the path：not-exist",
      path: "not-exist",
    });
  });
});
