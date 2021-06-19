import { TestStartup, Request } from "sfa";
import "../src";
import "./UseTest";

test("useRoutePraser", async function () {
  const res = await new TestStartup(
    new Request().setPath("/simple/adminAuth").setMethod("POST")
  )
    .useTest()
    .useRoutePraser()
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
