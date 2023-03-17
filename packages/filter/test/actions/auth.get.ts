import { Context } from "@halsp/core";
import { Action, ActionMetadata } from "@halsp/router";
import { AuthorizationFilter, UseFilters } from "../../src";

const Admin = ActionMetadata("admin", "true");

class TestAuthorizationFilter implements AuthorizationFilter {
  onAuthorization(ctx: Context): boolean | Promise<boolean> {
    ctx.res.set("admin", ctx.actionMetadata.admin);
    const executing: boolean = ctx.req.body["executing"];
    if (!executing) {
      ctx.res.unauthorizedMsg();
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
