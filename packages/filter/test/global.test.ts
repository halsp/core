import { Context } from "@ipare/core";
import { Request } from "@ipare/http";
import "../src";
import { ActionFilter } from "../src";
import "@ipare/inject";
import { Action } from "@ipare/router";
import { TestHttpStartup } from "@ipare/testing";

class TestAction extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

class TestActionFilter implements ActionFilter {
  onActionExecuted(ctx: Context): void | Promise<void> {
    ctx.res.setHeader(`action2`, 2);
  }
  onActionExecuting(
    ctx: Context
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.setHeader(`action1`, 1);
    return ctx.req.body["executing"];
  }
}

function runTest(executing: boolean) {
  test(`global filter ${executing}`, async () => {
    const res = await new TestHttpStartup()
      .setRequest(
        new Request().setPath("").setMethod("GET").setBody({
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
