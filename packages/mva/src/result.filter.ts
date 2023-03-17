import { Context } from "@halsp/core";
import { Filter } from "@halsp/filter";

export interface ResultFilter extends Filter {
  onResultExecuted(ctx: Context): void | Promise<void>;
  onResultExecuting(
    ctx: Context
  ): boolean | Promise<boolean> | void | Promise<void>;
}
