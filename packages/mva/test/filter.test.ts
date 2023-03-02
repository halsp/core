import { Request } from "@halsp/core";
import { TestHttpStartup } from "@halsp/testing/dist/http";
import "../src";
import { runMva } from "./global";
import "@halsp/filter";

function runTest(executing: boolean) {
  test(`filter ${executing}`, async () => {
    await runMva(async () => {
      const res = await new TestHttpStartup()
        .setContext(
          new Request().setPath("filter").setMethod("GET").setBody({
            executing,
          })
        )
        .useFilter()
        .useMva()
        .run();

      expect(res.status).toBe(200);
      expect(res.getHeader("result1")).toBe("1");
      expect(res.getHeader("result2")).toBe(executing ? "2" : undefined);
      expect(res.body).toBe(executing ? `<p>filter</p>` : "OK");
    });
  });
}

runTest(true);
runTest(false);
