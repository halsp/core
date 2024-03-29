import { Context } from "@halsp/core";
import { Filter } from "./filter";

export interface ExceptionFilter<T extends Error = Error> extends Filter {
  onException(ctx: Context, error: T): boolean | Promise<boolean>;
}
