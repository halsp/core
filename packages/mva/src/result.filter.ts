import { HttpContext } from "@sfajs/core";
import { Filter } from "@sfajs/filter";

export interface ResultFilter extends Filter {
  onResultExecuted(ctx: HttpContext): void | Promise<void>;
  onResultExecuting(
    ctx: HttpContext
  ): boolean | Promise<boolean> | void | Promise<void>;
}
