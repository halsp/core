import { HttpContext } from "@ipare/core";
import { Filter } from "@ipare/filter";

export interface ResultFilter extends Filter {
  onResultExecuted(ctx: HttpContext): void | Promise<void>;
  onResultExecuting(
    ctx: HttpContext
  ): boolean | Promise<boolean> | void | Promise<void>;
}
