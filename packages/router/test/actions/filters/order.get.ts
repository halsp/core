import { HttpContext } from "@sfajs/core";
import { Action, ActionFilter, UseFilters } from "../../../src";

export class TestActionFilter1 implements ActionFilter {
  onActionExecuted(_): void | Promise<void> {
    //
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`order1`, ctx.res.body);
  }
}

export class TestActionFilter2 implements ActionFilter {
  onActionExecuted(_): void | Promise<void> {
    //
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`order2`, ctx.res.body);
  }
}

export class TestActionFilter3 implements ActionFilter {
  onActionExecuted(_): void | Promise<void> {
    //
  }
  onActionExecuting(
    ctx: HttpContext
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.body++;
    ctx.res.setHeader(`order3`, ctx.res.body);
  }
}

@UseFilters(TestActionFilter1, new TestActionFilter2(), TestActionFilter3)
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}
