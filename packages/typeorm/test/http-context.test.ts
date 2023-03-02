import "../src";
import { TestStartup } from "@halsp/testing";

it("should get typeorm by ctx", async () => {
  await new TestStartup()
    .useTypeorm({
      identity: "abc",
      type: "sqlite",
      database: "test/sqlite.db",
    })
    .useTypeorm({
      type: "sqlite",
      database: "test/sqlite.db",
    })
    .use(async (ctx, next) => {
      expect(!!(await ctx.getTypeorm())).toBeTruthy();
      expect(!!(await ctx.getTypeorm("abc"))).toBeTruthy();
      expect(!!(await ctx.getTypeorm("def"))).toBeFalsy();

      await next();
    })
    .run();
});
