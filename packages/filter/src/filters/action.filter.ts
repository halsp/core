import { HttpContext } from "@ipare/core";
import { Filter } from "./filter";

export interface ActionFilter extends Filter {
  onActionExecuted(ctx: HttpContext): void | Promise<void>;
  onActionExecuting(
    ctx: HttpContext
  ): boolean | Promise<boolean> | void | Promise<void>;
}
