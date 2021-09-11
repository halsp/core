import "../../src";
import { TestStartup, SfaRequest } from "sfa";
import { HttpMethod } from "@sfajs/header";
import { routerCfg } from "../global";

test(`custom httpMethod test`, async function () {
  HttpMethod.custom.push("CUSTOM");
  const result = await new TestStartup(
    new SfaRequest().setPath("/restful/1").setMethod("CUSTOM")
  )
    .useRouter(routerCfg)
    .run();
  expect(result.status).toBe(200);
});

test(`custom httpMethod test err`, async function () {
  HttpMethod.custom.splice(0);
  const result = await new TestStartup(
    new SfaRequest().setPath("/restful/1").setMethod("CUSTOM")
  )
    .useRouter(routerCfg)
    .run();
  expect(result.status).toBe(405);
});
