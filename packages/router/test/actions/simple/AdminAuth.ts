import { Action, ActionMetadata } from "../../../src";

@ActionMetadata({
  roles: ["admin"],
})
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
