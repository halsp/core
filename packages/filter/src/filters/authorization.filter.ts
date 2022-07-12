import { HttpContext } from "@ipare/core";
import { Filter } from "./filter";

export interface AuthorizationFilter extends Filter {
  onAuthorization(ctx: HttpContext): boolean | Promise<boolean>;
}
