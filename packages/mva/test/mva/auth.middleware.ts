import { users } from "./mock";
import { Middleware } from "@sfajs/core";
import "../../src";
import "@sfajs/router";

export class AuthMiddleware extends Middleware {
  async invoke(): Promise<void> {
    if (
      !this.ctx.actionMetadata ||
      !this.ctx.actionMetadata.roles ||
      !this.ctx.actionMetadata.roles.length
    ) {
      return await this.next();
    }

    if (this.ctx.actionMetadata.roles.includes("pl")) {
      if (!(await this.paramsLoginAuth())) {
        this.forbiddenMsg({ message: "error email or password" });
        return;
      }
    }

    if (this.ctx.actionMetadata.roles.includes("hl")) {
      if (!(await this.headerLoginAuth())) {
        this.forbiddenMsg({ message: "error email or password" });
        return;
      }
    }

    await this.next();
  }

  private async headerLoginAuth(): Promise<boolean> {
    const { email, password } = this.ctx.req.headers;
    if (!email || !password) return false;
    return await this.loginAuth(email as string, password as string);
  }

  private async paramsLoginAuth(): Promise<boolean> {
    const { email } = this.ctx.req.params;
    const { password } = this.ctx.req.headers;
    if (!email || !password) return false;
    return await this.loginAuth(email, password as string);
  }

  private async loginAuth(email: string, password: string): Promise<boolean> {
    return users.some((u) => u.email == email && u.password == password);
  }
}
