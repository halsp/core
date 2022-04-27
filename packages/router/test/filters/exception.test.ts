import { SfaRequest, TestStartup } from "@sfajs/core";
import { routerCfg } from "../global";
import "../../src";

function runTest(executing: boolean) {
  function run(bad: boolean) {
    test(`exception filter ${executing} ${bad}`, async () => {
      const res = await new TestStartup(
        new SfaRequest()
          .setPath("/filters/exception")
          .setMethod("GET")
          .setBody({
            bad,
            executing,
          })
      )
        .use(async (ctx, next) => {
          ctx.setHeader("h1", 1);
          await next();
          ctx.setHeader("h2", 2);
        })
        .useRouter(routerCfg)
        .run();

      expect(res.getHeader(`h1`)).toBe("1");
      expect(res.getHeader(`h2`)).toBe("2");
      if (bad) {
        expect(res.getHeader(`ex`)).toBe("bad");
        if (executing) {
          expect(res.status).toBe(404);
        } else {
          expect(res.status).toBe(400);
        }
      } else {
        expect(res.getHeader(`ex`)).toBe("err");
        if (executing) {
          expect(res.status).toBe(404);
        } else {
          expect(res.status).toBe(500);
        }
      }
    });
  }
  run(true);
  run(false);
}

runTest(true);
runTest(false);
