import { SfaRequest, TestStartup } from "@sfajs/core";
import { routerCfg } from "../global";
import "../../src";

test("action decorators test", async function () {
  const res = await new TestStartup(
    new SfaRequest()
      .setPath("/decorator/action")
      .setMethod("GET")
      .setBody([0, 1])
      .setHeader("h1", 1)
      .setQuery("q", "q")
  )
    .useRouter(routerCfg)
    .run();
  expect(res.status).toBe(200);
  expect(res.body).toEqual({
    header: { h1: "1" },
    query1: { q: "q" },
    query2: { q: "q" },
    queryProperty: "q",
    queryProperty1: undefined,
    params: {},
    body: [0, 1],
    arrayFieldBody: undefined,
  });
});
