import { Action } from "../../../src";

export default class extends Action {
  constructor() {
    super();
    this.metadata.roles = ["admin"];
  }

  async invoke(): Promise<void> {
    const { account, password } = this.ctx.req.headers;

    this.ok({
      msg: "admin auth",
      account,
      password,
    });
  }
}
