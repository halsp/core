import { Context } from "@ipare/core";
import { Action } from "@ipare/router";
import { TestHttpStartup } from "@ipare/testing/dist/http";
import { execFilters, Filter, UseFilters } from "../src";

class CustomFilter implements Filter {
  execute(ctx: Context) {
    ctx.setHeader("custom", 1);
  }
}

@UseFilters(CustomFilter)
class TestAction extends Action {
  invoke(): void | Promise<void> {
    execFilters(this, true, "execute");
  }
}

test(`execFilters`, async () => {
  const res = await new TestHttpStartup()
    .use(async (ctx, next) => {
      ctx.res.body = 0;
      await next();
    })
    .useFilter()
    .add(TestAction)
    .run();
  expect(res.getHeader("custom")).toBe("1");
});
