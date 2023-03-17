import { Context } from "@halsp/core";
import { Filter } from "./filter";

export interface ActionFilter extends Filter {
  onActionExecuted(ctx: Context): void | Promise<void>;
  onActionExecuting(
    ctx: Context
  ): boolean | Promise<boolean> | void | Promise<void>;
}
