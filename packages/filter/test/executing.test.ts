import { HttpContext, Request, TestStartup } from "@ipare/core";
import "../src";
import { ActionFilter, ResourceFilter, UseFilters } from "../src";
import { Action } from "@ipare/router";

class TestResourceFilter implements ResourceFilter {
  onResourceExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.setHeader("resource2", 2);
  }
  onResourceExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.setHeader("resource1", 1);
    return ctx.req.body["resource-executing"];
  }
}

class TestActionFilter implements ActionFilter {
  onActionExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.setHeader("action2", 2);
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.setHeader("action1", 1);
    return ctx.req.body["action-executing"];
  }
}

@UseFilters(TestActionFilter)
@UseFilters(new TestResourceFilter())
class TestAction extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}

function runExecuting(type: string) {
  function runTest(executing: boolean) {
    test(`${type} filter ${executing}`, async () => {
      const body: any = {};
      body[`${type}-executing`] = executing;

      const res = await new TestStartup(
        new Request()
          .setPath("/filters/executing")
          .setMethod("GET")
          .setBody(body)
      )
        .useFilter()
        .add(TestAction)
        .run();
      expect(res.getHeader(`${type}1`)).toBe("1");
      if (executing) {
        expect(res.getHeader(`${type}2`)).toBe("2");
        expect(res.status).toBe(200);
      } else {
        expect(res.getHeader(`${type}2`)).toBeUndefined();
        expect(res.status).toBe(404);
      }
    });
  }

  runTest(true);
  runTest(false);
}

runExecuting("action");
runExecuting("resource");
