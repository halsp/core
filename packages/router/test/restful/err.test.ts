import "../../src";
import { TestStartup, SfaRequest } from "sfa";
import { HttpMethod } from "@sfajs/header";
import { routerCfg } from "../global";

test(`action name error`, async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/err").setMethod(HttpMethod.post)
  )
    .useRouter(routerCfg)
    .run();

  expect(result.status).toBe(405);
});

test(`without method`, async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/restful").setMethod("")
  )
    .useRouter(routerCfg)
    .run();

  expect(result.status).toBe(200);
  expect(result.body).toEqual({
    method: "ANY",
  });
});
