import { HttpContext } from "@sfajs/core";
import { UseFilters } from "@sfajs/filter";
import { Action } from "@sfajs/router";
import { ResultFilter } from "../../../src";

class TestFilter implements ResultFilter {
  onResultExecuted(ctx: HttpContext): void | Promise<void> {
    ctx.res.setHeader("result2", 2);
  }
  onResultExecuting(
    ctx: HttpContext
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
