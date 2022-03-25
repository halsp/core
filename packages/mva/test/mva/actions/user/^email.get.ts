import { Action } from "@sfajs/router";
import * as linq from "linq";
import { users } from "../../mock";

export default class extends Action {
  constructor() {
    super();
    this.metadata.roles = ["pl"];
  }

  async invoke(): Promise<void> {
    const email = this.ctx.req.params.email;
    this.ok(
      linq
        .from(users)
        .where((u) => u.email == email)
        .first()
    );
  }
}
