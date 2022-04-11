import { SfaRequest, SfaResponse, TestStartup } from "@sfajs/core";
import "../src";
import { AuthMiddleware } from "./mva/auth.middleware";
import { runMva } from "./global";

function expect404(res: SfaResponse, isPage: boolean, replaceCode = 404) {
  expect(res.status).toBe(replaceCode);
  if (isPage) {
    expect(res.getHeader("content-type")).toBe("text/html");
    expect(res.body).toBe("<p>404</p>");
  } else {
    expect(res.getHeader("content-type")).toBe(
      "application/json; charset=utf-8"
    );
    expect(res.body).toEqual({
      message: "Can't find the path：not-exist",
      path: "not-exist",
      status: 404,
    });
  }
}

test("403", async function () {
  await runMva(async () => {
    const res = await new TestStartup(
      new SfaRequest()
        .setPath("user/test1@hal.wang")
        .setMethod("GET")
        .setHeader("password", "test2password")
    )
      .useErrorPage([{ code: 403 }])
      .add(AuthMiddleware)
      .useMva()
      .run();

    expect(res.status).toBe(403);
    expect(res.body).toBe("<p>403</p>");
  });
});

function run404(isNumber: boolean, useAgain: boolean) {
  test(`useErrorPage ${isNumber}`, async function () {
    const codes = [isNumber ? 404 : { code: 404 }];
    await runMva(async () => {
      const startup = new TestStartup(
        new SfaRequest().setPath("not-exist").setMethod("GET")
      )
        .useErrorPage(codes)
        .useMva();
      if (useAgain) {
        startup.useErrorPage(codes).useMva();
      }

      const res = await startup.run();

      expect404(res, true);
    });
  });
}
run404(true, true);
run404(true, false);
run404(false, true);
run404(false, false);

test("replace", async function () {
  await runMva(async () => {
    const res = await new TestStartup(
      new SfaRequest().setPath("not-exist").setMethod("GET")
    )
      .useErrorPage({ code: 404, replace: 204 })
      .useMva()
      .run();

    expect404(res, true, 204);
  });
});

test("404 without error page", async function () {
  await runMva(async () => {
    const res = await new TestStartup(
      new SfaRequest().setPath("not-exist").setMethod("GET")
    )
      .useMva()
      .run();

    expect404(res, false);
  });
});

test("string error", async function () {
  await runMva(async () => {
    const res = await new TestStartup(new SfaRequest().setMethod("GET"))
      .useErrorPage([{ code: 404 }])
      .use(() => {
        throw "test";
      })
      .run();

    expect(res.status).toBe(500);
  });
});

function runEmptyCode(isArray: boolean) {
  test(`without error code ${isArray}`, async function () {
    await runMva(async () => {
      const startup = new TestStartup(
        new SfaRequest().setPath("not-exist").setMethod("GET")
      );
      if (isArray) {
        startup.useErrorPage([]);
      } else {
        startup.useErrorPage();
      }
      const res = await startup.useMva().run();

      expect404(res, false);
    });
  });
}

runEmptyCode(true);
runEmptyCode(false);

test(`useMva before useErrorPage`, async function () {
  await runMva(async () => {
    const res = await new TestStartup(
      new SfaRequest().setPath("not-exist").setMethod("GET")
    )
      .useMva()
      .useErrorPage(404)
      .run();

    expect404(res, false);
  });
});
