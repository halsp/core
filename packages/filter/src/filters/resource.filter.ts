import { Context } from "@halsp/common";
import { Filter } from "./filter";

export interface ResourceFilter extends Filter {
  onResourceExecuted(ctx: Context): void | Promise<void>;
  onResourceExecuting(
    ctx: Context
  ): boolean | Promise<boolean> | void | Promise<void>;
}
