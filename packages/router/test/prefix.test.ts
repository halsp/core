import { TestStartup, SfaRequest } from "sfa";
import "../src";
import { routerCfg } from "./global";

test("prefix", async function () {
  const cfg = routerCfg;
  cfg.prefix = "api2";

  const result = await new TestStartup(
    new SfaRequest().setPath("/api2/simple/router").setMethod("POST")
  )
    .useRouter(cfg)
    .run();
  expect(result.status).toBe(200);
});

test("error prefix", async function () {
  const cfg = routerCfg;
  cfg.prefix = "error";

  const result = await new TestStartup(
    new SfaRequest().setPath("/api2/simple/router").setMethod("POST")
  )
    .useRouter(cfg)
    .run();
  expect(result.status).toBe(404);
});
