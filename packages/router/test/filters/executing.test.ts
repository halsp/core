import { SfaRequest, TestStartup } from "@sfajs/core";
import { routerCfg } from "../global";
import "../../src";

function runExecuting(type: string) {
  function runTest(executing: boolean) {
    test(`${type} filter ${executing}`, async () => {
      const body: any = {};
      body[`${type}-executing`] = executing;

      const res = await new TestStartup(
        new SfaRequest()
          .setPath("/filters/executing")
          .setMethod("GET")
          .setBody(body)
      )
        .useRouter(routerCfg)
        .run();
      expect(res.getHeader(`${type}1`)).toBe("1");
      if (executing) {
        expect(res.getHeader(`${type}2`)).toBe("2");
        expect(res.status).toBe(200);
      } else {
        expect(res.getHeader(`${type}2`)).toBeUndefined();
        expect(res.status).toBe(404);
      }
    });
  }

  runTest(true);
  runTest(false);
}

runExecuting("action");
runExecuting("resource");
