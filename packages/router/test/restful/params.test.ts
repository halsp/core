import { TestStartup, SfaRequest } from "sfa";
import "../../src";
import { HttpMethod } from "@sfajs/header";
import { routerCfg } from "../global";

test(`restful params test1`, async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/restful/45").setMethod(HttpMethod.get)
  )
    .useRouter(routerCfg)
    .run();
  expect(result.status).toBe(200);
  expect(result.body.id).toBe("45");
});

test(`restful params test2`, async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/restful/11/animals").setMethod(HttpMethod.get)
  )
    .useRouter(routerCfg)
    .run();
  expect(result.status).toBe(200);
  expect(result.body.id).toBe("11");
});
