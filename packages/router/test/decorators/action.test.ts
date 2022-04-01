import { SfaRequest, TestStartup } from "@sfajs/core";
import { routerCfg } from "../global";
import "../../src";

test("action decorators test", async function () {
  const res = await new TestStartup(
    new SfaRequest()
      .setPath("/decorator/action")
      .setMethod("GET")
      .setBody({ b: 1 })
      .setHeader("h1", 1)
      .setQuery("q1", "q")
  )
    .useRouter(routerCfg)
    .run();
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    header: { h1: "1" },
    query1: { q1: "q" },
    query2: { q1: "q" },
    params: {},
    body: { b: 1 },
  });
});
