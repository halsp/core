import { Request } from "@ipare/http";
import { TestHttpStartup } from "@ipare/testing";
import "../src";

function runTest(executing: boolean) {
  test(`authorization filter ${executing}`, async () => {
    process.chdir(__dirname);
    try {
      const res = await new TestHttpStartup()
        .setRequest(
          new Request().setMethod("get").setPath("auth").setBody({
            executing,
          })
        )
        .use(async (ctx, next) => {
          ctx.setHeader("h1", 1);
          await next();
          ctx.setHeader("h2", 2);
        })
        .useFilter()
        .useRouter()
        .run();

      expect(res.getHeader(`h1`)).toBe("1");
      expect(res.getHeader(`h2`)).toBe("2");
      if (executing) {
        expect(res.status).toBe(200);
      } else {
        expect(res.status).toBe(401);
      }
    } finally {
      process.chdir("..");
    }
  });
}

runTest(false);
runTest(true);
