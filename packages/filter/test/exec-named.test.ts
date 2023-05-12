import { Context, Startup } from "@halsp/core";
import { Action } from "@halsp/router";
import "@halsp/testing";
import "@halsp/http";
import { execFilters, Filter, UseFilters } from "../src";

class CustomFilter implements Filter {
  execute(ctx: Context) {
    ctx.res.set("custom", 1);
  }
}

@UseFilters(CustomFilter)
class TestAction extends Action {
  invoke(): void | Promise<void> {
    execFilters(this, true, "execute");
  }
}

test(`execFilters`, async () => {
  const res = await new Startup()
    .useHttp()
    .use(async (ctx, next) => {
      ctx.res.body = 0;
      await next();
    })
    .useFilter()
    .add(TestAction)
    .test();
  expect(res.getHeader("custom")).toBe("1");
});
