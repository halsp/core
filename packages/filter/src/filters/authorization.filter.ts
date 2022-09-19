import { Context } from "@ipare/core";
import { Filter } from "./filter";

export interface AuthorizationFilter extends Filter {
  onAuthorization(ctx: Context): boolean | Promise<boolean>;
}
