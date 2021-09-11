import { TestStartup, SfaRequest } from "sfa";
import "../../src";
import { HttpMethod } from "@sfajs/header";
import { routerCfg } from "../global";

test("restful root get", async function () {
  const result = await new TestStartup(
    new SfaRequest().setPath("/").setMethod(HttpMethod.get.toUpperCase())
  )
    .useRouter(routerCfg)
    .run();
  expect(result.status).toBe(200);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(result.body.method).toBe(HttpMethod.get);
});
