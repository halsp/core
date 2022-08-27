import { Action, ActionMetadata } from "../../../src";

@ActionMetadata("roles", ["login"])
export default class extends Action {
  async invoke(): Promise<void> {
    const { account, password } = this.ctx.req.headers;

    this.ok({
      msg: "login auth",
      account,
      password,
    });
  }
}
