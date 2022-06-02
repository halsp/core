import { TestStartup, SfaRequest, HttpMethod } from "@sfajs/core";
import "../../src";
import { routerCfg } from "../global";

test("restful root get", async () => {
  const result = await new TestStartup(
    new SfaRequest().setPath("/").setMethod(HttpMethod.get.toUpperCase())
  )
    .useRouter(routerCfg)
    .run();
  expect(result.status).toBe(200);
  expect(result.body.method).toBe(HttpMethod.get);
});
