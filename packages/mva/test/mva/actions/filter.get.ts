import { Context } from "@ipare/core";
import { UseFilters } from "@ipare/filter";
import { Action } from "@ipare/router";
import { ResultFilter } from "../../../src";

class TestFilter implements ResultFilter {
  onResultExecuted(ctx: Context): void | Promise<void> {
    ctx.res.setHeader("result2", 2);
  }
  onResultExecuting(
    ctx: Context
  ): boolean | void | Promise<void> | Promise<boolean> {
    ctx.res.setHeader("result1", 1);
    return ctx.req.body["executing"];
  }
}

@UseFilters(TestFilter)
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok("OK");
  }
}
