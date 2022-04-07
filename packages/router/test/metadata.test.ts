import { SfaRequest, TestStartup } from "@sfajs/core";
import "../src";
import { routerCfg } from "./global";

test("metadata", async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("/metadata").setMethod("GET")
  )
    .useRouterParser(routerCfg)
    .use((ctx) => {
      ctx.ok({
        custom: ctx.routerMapItem.custom,
        admin: ctx.routerMapItem.admin,
      });
    })
    .useRouter()
    .run();
  expect(result.body).toEqual({
    custom: "11",
    admin: true,
  });
  expect(result.status).toBe(200);
});

function testReplace(replace: boolean) {
  test("notreplace metadata", async () => {
    const result = await new TestStartup(
      new SfaRequest()
        .setPath("/metadata/" + (replace ? "replace" : "notreplace"))
        .setMethod("POST")
    )
      .useRouterParser(routerCfg)
      .use((ctx) => {
        ctx.ok({
          custom1: ctx.routerMapItem.custom1,
          custom2: ctx.routerMapItem.custom2,
        });
      })
      .useRouter()
      .run();
    expect(result.body).toEqual({
      custom1: "1",
      custom2: replace ? undefined : "2",
    });
    expect(result.status).toBe(200);
  });
}

testReplace(true);
testReplace(false);
