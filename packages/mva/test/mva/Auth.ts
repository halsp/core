import { users } from "./mock";
import * as linq from "linq";
import { Middleware } from "sfa";
import "../../src";

export default class Auth extends Middleware {
  async invoke(): Promise<void> {
    if (!this.ctx.routerMapItem.roles || !this.ctx.routerMapItem.roles.length) {
      return await this.next();
    }

    if (this.ctx.routerMapItem.roles.includes("pl")) {
      if (!(await this.paramsLoginAuth())) {
        this.forbiddenMsg({ message: "error email or password" });
        return;
      }
    }

    if (this.ctx.routerMapItem.roles.includes("hl")) {
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
    return linq
      .from(users)
      .any((u) => u.email == email && u.password == password);
  }
}
