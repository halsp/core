import "../../src";
import { TestStartup, SfaRequest } from "@sfajs/core";
import { routerCfg } from "../global";

test(`method not allowed`, async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("/restful/1").setMethod("NO")
  )
    .useRouter(routerCfg)
    .run();
  expect(result.status).toBe(405);
});
