import { HttpContext } from "@ipare/core";
import { Action, SetActionMetadata } from "@ipare/router";
import { AuthorizationFilter, UseFilters } from "../../src";

const Admin = SetActionMetadata("admin", "true");

class TestAuthorizationFilter implements AuthorizationFilter {
  onAuthorization(ctx: HttpContext): boolean | Promise<boolean> {
    ctx.setHeader("admin", ctx.actionMetadata.admin);
    const executing: boolean = ctx.req.body["executing"];
    if (!executing) {
      ctx.unauthorizedMsg();
    }
    return executing;
  }
}

@Admin
@UseFilters(TestAuthorizationFilter)
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok();
  }
}
