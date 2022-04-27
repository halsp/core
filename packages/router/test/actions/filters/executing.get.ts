import { HttpContext } from "@sfajs/core";
import { Action, ActionFilter, ResourceFilter, UseFilters } from "../../../src";

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
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}
