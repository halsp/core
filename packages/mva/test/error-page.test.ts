import { NotFoundException } from "@halsp/http";
import "../src";
import { AutFilter } from "./mva/auth.middleware";
import { runMva } from "./global";
import { Request, Response, Startup } from "@halsp/core";
import "@halsp/testing";

function expect404(res: Response, isPage: boolean, replaceCode = 404) {
  expect(res.status).toBe(replaceCode);
  if (isPage) {
    expect(res.getHeader("content-type")).toBe("text/html");
    expect(res.body).toBe("<p>404</p>");
  } else {
    expect(res.getHeader("content-type")).toBe(
      "application/json; charset=utf-8",
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
          const startup = new Startup()
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

          const res = await startup.test();
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
    const res = await new Startup()
      .keepThrow()
      .setContext(
        new Request()
          .setPath("user/test1@hal.wang")
          .setMethod("GET")
          .setHeader("password", "test2password"),
      )
      .useErrorPage([{ code: 403 }])
      .useGlobalFilter(AutFilter)
      .useMva()
      .test();

    expect(res.status).toBe(403);
    expect(res.body).toBe("<p>403</p>");
  });
});

test("replace", async function () {
  await runMva(async () => {
    const res = await new Startup()
      .keepThrow()
      .setContext(new Request().setPath("not-exist").setMethod("GET"))
      .useErrorPage({ code: 404, replace: 204 })
      .useMva()
      .test();

    expect404(res, true, 204);
  });
});

test("404 without error page", async function () {
  await runMva(async () => {
    const res = await new Startup()
      .keepThrow()
      .setContext(new Request().setPath("not-exist").setMethod("GET"))
      .useMva()
      .test();

    expect404(res, false);
  });
});

test("string error", async function () {
  await runMva(async () => {
    const res = await new Startup()
      .useHttp()
      .setContext(new Request().setMethod("GET"))
      .useErrorPage([{ code: 404 }])
      .use(() => {
        throw "test";
      })
      .test();

    expect(res.status).toBe(500);
  });
});

function runEmptyCode(isArray: boolean) {
  test(`without error code ${isArray}`, async function () {
    await runMva(async () => {
      const startup = new Startup()
        .keepThrow()
        .setContext(new Request().setPath("not-exist").setMethod("GET"));
      if (isArray) {
        startup.useErrorPage([]);
      } else {
        startup.useErrorPage();
      }
      const res = await startup.useMva().test();

      expect404(res, false);
    });
  });
}

runEmptyCode(true);
runEmptyCode(false);

test(`useMva before useErrorPage`, async function () {
  await runMva(async () => {
    const res = await new Startup()
      .keepThrow()
      .useMva()
      .useErrorPage(404)
      .setContext(new Request().setPath("not-exist").setMethod("GET"))
      .test();

    expect404(res, true);
  });
});

test(`404 default`, async function () {
  await runMva(async () => {
    const startup = new Startup()
      .useHttp()
      .setContext(new Request().setPath("not-exist").setMethod("GET"))
      .useErrorPage()
      .use(async () => {
        throw new NotFoundException({
          message: "Can't find the path：not-exist",
          path: "not-exist",
        });
      });
    const res = await startup.test();

    expect404(res, false);
  });
});
