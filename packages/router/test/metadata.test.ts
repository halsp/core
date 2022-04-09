import { SfaRequest, TestStartup } from "@sfajs/core";
import "../src";
import { routerCfg } from "./global";

test("metadata", async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("/metadata").setMethod("GET")
  )
    .useRouterParser(routerCfg)
    .useRouter()
    .run();
  expect(result.body).toEqual({
    get: {
      custom: "11",
      admin: true,
    },
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
          custom1: ctx.actionMetadata.custom1,
          custom2: ctx.actionMetadata.custom2,
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

test("object metadata", async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("/metadata/object").setMethod("GET")
  )
    .useRouterParser(routerCfg)
    .useRouter()
    .run();
  expect(result.body).toEqual({
    object: {
      m1: "1",
      m2: "2",
      m3: "3",
    },
    constructor: {
      m1: "1",
      m2: "2",
      m3: "3",
    },
  });
  expect(result.status).toBe(200);
});
