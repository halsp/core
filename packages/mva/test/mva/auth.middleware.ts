import { users } from "./mock";
import { HttpContext } from "@ipare/core";
import "../../src";
import "@ipare/router";
import { AuthorizationFilter } from "@ipare/filter";

export class AutFilter implements AuthorizationFilter {
  async onAuthorization(ctx: HttpContext): Promise<boolean> {
    if (
      !ctx.actionMetadata ||
      !ctx.actionMetadata.roles ||
      !ctx.actionMetadata.roles.length
    ) {
      return true;
    }

    if (ctx.actionMetadata.roles.includes("pl")) {
      if (!(await this.paramsLoginAuth(ctx))) {
        ctx.forbiddenMsg({ message: "error email or password" });
        return false;
      }
    }

    if (ctx.actionMetadata.roles.includes("hl")) {
      if (!(await this.headerLoginAuth(ctx))) {
        ctx.forbiddenMsg({ message: "error email or password" });
        return false;
      }
    }

    return true;
  }

  private async headerLoginAuth(ctx: HttpContext): Promise<boolean> {
    const { email, password } = ctx.req.headers;
    if (!email || !password) return false;
    return await this.loginAuth(email as string, password as string);
  }

  private async paramsLoginAuth(ctx: HttpContext): Promise<boolean> {
    const { email } = ctx.req.params;
    const { password } = ctx.req.headers;
    if (!email || !password) return false;
    return await this.loginAuth(email, password as string);
  }

  private async loginAuth(email: string, password: string): Promise<boolean> {
    return users.some((u) => u.email == email && u.password == password);
  }
}
