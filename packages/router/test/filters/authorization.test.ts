import { SfaRequest, TestStartup } from "@sfajs/core";
import { routerCfg } from "../global";
import "../../src";

function runTest(executing: boolean) {
  test(`authorization filter ${executing}`, async () => {
    const res = await new TestStartup(
      new SfaRequest()
        .setPath("/filters/authorization")
        .setMethod("GET")
        .setBody({
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

    console.log("body", res.body);
    expect(res.getHeader(`h1`)).toBe("1");
    expect(res.getHeader(`h2`)).toBe("2");
    if (executing) {
      expect(res.status).toBe(200);
    } else {
      expect(res.status).toBe(401);
    }
  });
}

runTest(true);
runTest(false);
