import "../../src";
import { TestStartup, SfaRequest } from "sfa";
import { routerCfg } from "../global";

test(`method not allowed`, async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/restful/1").setMethod("NO")
  )
    .useRouter(routerCfg)
    .run();
  expect(result.status).toBe(405);
});
