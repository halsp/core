import { Action, SetActionMetadata } from "../../../src";

@SetActionMetadata("roles", ["admin"])
export default class extends Action {
  async invoke(): Promise<void> {
    const { account, password } = this.ctx.req.headers;

    this.ok({
      msg: "admin auth",
      account,
      password,
    });
  }
}
