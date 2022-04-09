import { Action, ActionMetadata } from "@sfajs/router";
import { users } from "../../mock";

@ActionMetadata({
  roles: ["pl"],
})
export default class extends Action {
  async invoke(): Promise<void> {
    const email = this.ctx.req.params.email;
    this.ok(users.filter((u) => u.email == email)[0]);
  }
}
