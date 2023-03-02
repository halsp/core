import { Action, SetActionMetadata } from "@halsp/router";
import { users } from "../../mock";

@SetActionMetadata("roles", ["pl"])
export default class extends Action {
  async invoke(): Promise<void> {
    const email = this.ctx.req.params.email;
    this.ok(users.filter((u) => u.email == email)[0]);
  }
}
