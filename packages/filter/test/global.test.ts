import { HttpContext, SfaRequest, TestStartup } from "@sfajs/core";
import "../src";
import { ActionFilter } from "../src";
import "@sfajs/inject";
import { Action } from "@sfajs/router";

class TestAction extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

class TestActionFilter implements ActionFilter {
  onActionExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.setHeader(`action2`, 2);
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.setHeader(`action1`, 1);
    return ctx.req.body["executing"];
  }
}

function runTest(executing: boolean) {
  test(`global filter ${executing}`, async () => {
    const res = await new TestStartup(
      new SfaRequest().setPath("").setMethod("GET").setBody({
        executing,
      })
    )
      .useGlobalFilter(TestActionFilter)
      .useGlobalFilter(TestActionFilter)
      .add(TestAction)
      .run();

    expect(res.getHeader(`action1`)).toBe("1");
    if (executing) {
      expect(res.getHeader(`action2`)).toBe("2");
      expect(res.status).toBe(200);
    } else {
      expect(res.getHeader(`action2`)).toBeUndefined();
      expect(res.status).toBe(404);
    }
  });
}
runTest(true);
runTest(false);
