import { Request } from "@ipare/core";
import { TestHttpStartup } from "@ipare/testing/dist/http";
import "../src";
import { runin } from "@ipare/testing";

function runTest(executing: boolean) {
  test(`authorization filter ${executing}`, async () => {
    await runin(__dirname, async () => {
      const res = await new TestHttpStartup()
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
        .run();

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
