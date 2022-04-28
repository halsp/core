import { HttpContext } from "@sfajs/core";
import { Filter } from "./filter";

export interface AuthorizationFilter extends Filter {
  onAuthorization(ctx: HttpContext): boolean | Promise<boolean>;
}
