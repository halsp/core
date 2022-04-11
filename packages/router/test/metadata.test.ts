import { SfaRequest, TestStartup } from "@sfajs/core";
import "../src";
import { routerCfg } from "./global";

test("custom metadata", async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("/metadata/custom").setMethod("GET")
  )
    .useRouter(routerCfg)
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

test("set metadata", async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("/metadata/set-metadata").setMethod("GET")
  )
    .useRouter(routerCfg)
    .run();
  expect(result.body).toEqual({
    object: {
      m1: 1,
      m2: 2,
      m3: 3,
    },
    constructor: {
      m1: 1,
      m2: 2,
      m3: 3,
    },
    m1: 1,
  });
  expect(result.status).toBe(200);
});
