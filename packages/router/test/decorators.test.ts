import { SfaRequest, TestStartup } from "@sfajs/core";
import { routerCfg } from "./global";
import "../src";

test("decorators test", async function () {
  const res = await new TestStartup(
    new SfaRequest()
      .setPath("/decorator")
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
    query: { q1: "q" },
    params: {},
    body: { b: 1 },
  });
});
