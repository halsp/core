import { HttpContext, TestStartup } from "@ipare/core";
import { Action } from "@ipare/router";
import { execFilters, Filter, UseFilters } from "../src";

class CustomFilter implements Filter {
  execute(ctx: HttpContext) {
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
  const res = await new TestStartup()
    .use(async (ctx, next) => {
      ctx.res.body = 0;
      await next();
    })
    .useFilter()
    .add(TestAction)
    .run();
  expect(res.getHeader("custom")).toBe("1");
});
