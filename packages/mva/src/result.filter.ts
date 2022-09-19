import { Context } from "@ipare/core";
import { Filter } from "@ipare/filter";

export interface ResultFilter extends Filter {
  onResultExecuted(ctx: Context): void | Promise<void>;
  onResultExecuting(
    ctx: Context
  ): boolean | Promise<boolean> | void | Promise<void>;
}
