import { NotFoundException } from "@ipare/http";
import "../src";
import { AutFilter } from "./mva/auth.middleware";
import { runMva } from "./global";
import { Request, Response } from "@ipare/core";
import { TestHttpStartup } from "@ipare/testing-http";

function expect404(res: Response, isPage: boolean, replaceCode = 404) {
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

function run404(isNumber: boolean) {
  function runUseAgain(useAgain: boolean) {
    function runError(throwError: boolean) {
      test(`useErrorPage ${isNumber} ${useAgain} ${throwError}`, async function () {
        const codes = [isNumber ? 404 : { code: 404 }];
        await runMva(async () => {
          const startup = new TestHttpStartup()
            .skipThrow()
            .setContext(new Request().setPath("not-exist").setMethod("GET"))
            .useErrorPage(codes)
            .use(async (ctx, next) => {
              if (throwError) {
                throw new NotFoundException();
              }
              await next();
            })
            .useMva();
          if (useAgain) {
            startup.useErrorPage(codes).useMva();
          }

          const res = await startup.run();
          expect404(res, true);
        });
      });
    }
    runError(true);
    runError(false);
  }
  runUseAgain(true);
  runUseAgain(false);
}
run404(true);
run404(false);

test("403", async function () {
  await runMva(async () => {
    const res = await new TestHttpStartup()
      .setContext(
        new Request()
          .setPath("user/test1@hal.wang")
          .setMethod("GET")
          .setHeader("password", "test2password")
      )
      .useErrorPage([{ code: 403 }])
      .useGlobalFilter(AutFilter)
      .useMva()
      .run();

    expect(res.status).toBe(403);
    expect(res.body).toBe("<p>403</p>");
  });
});

test("replace", async function () {
  await runMva(async () => {
    const res = await new TestHttpStartup()
      .setContext(new Request().setPath("not-exist").setMethod("GET"))
      .useErrorPage({ code: 404, replace: 204 })
      .useMva()
      .run();

    expect404(res, true, 204);
  });
});

test("404 without error page", async function () {
  await runMva(async () => {
    const res = await new TestHttpStartup()
      .setContext(new Request().setPath("not-exist").setMethod("GET"))
      .useMva()
      .run();

    expect404(res, false);
  });
});

test("string error", async function () {
  await runMva(async () => {
    const res = await new TestHttpStartup()
      .skipThrow()
      .setContext(new Request().setMethod("GET"))
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
      const startup = new TestHttpStartup().setContext(
        new Request().setPath("not-exist").setMethod("GET")
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
    const res = await new TestHttpStartup()
      .setContext(new Request().setPath("not-exist").setMethod("GET"))
      .useMva()
      .useErrorPage(404)
      .run();

    expect404(res, false);
  });
});

test(`404 default`, async function () {
  await runMva(async () => {
    const startup = new TestHttpStartup()
      .skipThrow()
      .setContext(new Request().setPath("not-exist").setMethod("GET"))
      .useErrorPage()
      .use(async () => {
        throw new NotFoundException({
          message: "Can't find the path：not-exist",
          path: "not-exist",
        });
      });
    const res = await startup.run();

    expect404(res, false);
  });
});
