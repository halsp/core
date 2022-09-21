import { Context } from "@ipare/core";
import { HttpException } from "@ipare/http";
import { Filter } from "./filter";

export interface ExceptionFilter<T extends Error = HttpException>
  extends Filter {
  onException(ctx: Context, error: T): boolean | Promise<boolean>;
}
