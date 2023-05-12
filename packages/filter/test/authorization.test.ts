import { Request, Startup } from "@halsp/core";
import "@halsp/http";
import "../src";
import { runin } from "@halsp/testing";

function runTest(executing: boolean) {
  test(`authorization filter ${executing}`, async () => {
    await runin(__dirname, async () => {
      const res = await new Startup()
        .useHttp()
        .setContext(
          new Request().setMethod("get").setPath("auth").setBody({
            executing,
          })
        )
        .use(async (ctx, next) => {
          ctx.set("h1", 1);
          await next();
          ctx.set("h2", 2);
        })
        .useFilter()
        .useRouter()
        .test();

      expect(res.ctx.get(`h1`)).toBe(1);
      expect(res.ctx.get(`h2`)).toBe(2);
      if (executing) {
        expect(res.status).toBe(200);
      } else {
        expect(res.status).toBe(401);
      }
    });
  });
}

runTest(false);
runTest(true);
