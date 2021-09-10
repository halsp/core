import { TestStartup, SfaRequest } from "sfa";
import "../src";

test("useRouterParser", async function () {
  const res = await new TestStartup(
    new SfaRequest().setPath("/simple/adminAuth").setMethod("POST")
  )
    .useRouterParser("test/controllers")
    .use(async (ctx) => {
      ctx.res.body = {
        mapItem: ctx.routerMapItem,
      };
    })
    .run();

  expect(res.body).toEqual({
    mapItem: {
      path: "simple/AdminAuth.ts",
      roles: ["admin"],
    },
  });
});

test("useRouterParser once more", async function () {
  const res = await new TestStartup(
    new SfaRequest().setPath("/simple/adminAuth").setMethod("POST")
  )
    .useRouterParser("test/controllers")
    .useRouterParser("test/controllers")
    .use(async (ctx) => {
      ctx.res.body = {
        mapItem: ctx.routerMapItem,
      };
    })
    .run();

  expect(res.body).toEqual({
    mapItem: {
      path: "simple/AdminAuth.ts",
      roles: ["admin"],
    },
  });
});

test("router parser error", async function () {
  const res = await new TestStartup(
    new SfaRequest().setPath("/simple/adminAuth").setMethod("POST")
  )
    .useRouterParser("notexist")
    .useRouterParser("notexist")
    .useRouter()
    .run();

  expect(res.status).toBe(404);
});

test("router parser default", async function () {
  const res = await new TestStartup(
    new SfaRequest().setPath("/simple/adminAuth").setMethod("POST")
  )
    .useRouterParser()
    .useRouter()
    .run();

  expect(res.status).toBe(404);
});

test("router parser default", async function () {
  try {
    await new TestStartup(
      new SfaRequest().setPath("/simple/adminAuth").setMethod("POST")
    )
      .use(async (ctx, next) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ctx as any).actionPath = "not-exist";
        await next();
      })
      .useRouter()
      .run();

    expect(true).toBeFalsy();
  } catch (err) {}
});
