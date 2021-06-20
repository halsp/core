import { TestStartup, Request } from "sfa";
import "../src";

test("useRouterPraser", async function () {
  const res = await new TestStartup(
    new Request().setPath("/simple/adminAuth").setMethod("POST")
  )
    .useRouterPraser("../test/controllers", false)
    .use(async (ctx) => {
      ctx.res.body = {
        path: ctx.actionPath,
        roles: ctx.actionRoles,
      };
    })
    .run();

  expect(res.body).toEqual({
    path: "simple/AdminAuth.ts",
    roles: ["admin"],
  });
});

test("useRouterPraser once more", async function () {
  const res = await new TestStartup(
    new Request().setPath("/simple/adminAuth").setMethod("POST")
  )
    .useRouterPraser("../test/controllers")
    .useRouterPraser("../test/controllers")
    .use(async (ctx) => {
      ctx.res.body = {
        path: ctx.actionPath,
        roles: ctx.actionRoles,
      };
    })
    .run();

  expect(res.body).toEqual({
    path: "simple/AdminAuth.ts",
    roles: ["admin"],
  });
});

test("router praser error", async function () {
  const res = await new TestStartup(
    new Request().setPath("/simple/adminAuth").setMethod("POST")
  )
    .useRouterPraser("notexist")
    .useRouterPraser("notexist")
    .useRouter()
    .run();

  expect(res.status).toBe(404);
});

test("router praser default", async function () {
  const res = await new TestStartup(
    new Request().setPath("/simple/adminAuth").setMethod("POST")
  )
    .useRouterPraser()
    .useRouter()
    .run();

  expect(res.status).toBe(404);
});
