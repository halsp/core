import { HttpContext } from "@sfajs/core";
import { Filter } from "./filter";

export interface ResourceFilter extends Filter {
  onResourceExecuted(ctx: HttpContext): void | Promise<void>;
  onResourceExecuting(
    ctx: HttpContext
  ): boolean | Promise<boolean> | void | Promise<void>;
}
