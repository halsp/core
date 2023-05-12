import { Request, Startup } from "@halsp/core";
import "@halsp/testing";
import "../src";
import { runMva } from "./global";
import "@halsp/filter";

function runTest(executing: boolean) {
  test(`filter ${executing}`, async () => {
    await runMva(async () => {
      const res = await new Startup()
        .setContext(
          new Request().setPath("filter").setMethod("GET").setBody({
            executing,
          })
        )
        .useFilter()
        .useMva()
        .test();

      expect(res.status).toBe(200);
      expect(res.getHeader("result1")).toBe("1");
      expect(res.getHeader("result2")).toBe(executing ? "2" : undefined);
      expect(res.body).toBe(executing ? `<p>filter</p>` : "OK");
    });
  });
}

runTest(true);
runTest(false);
