import { ObjectConstructor } from "@halsp/core";
import { Action, getActionMetadata, ActionMetadata } from "../../../src";

const Admin = ActionMetadata("admin", true);

@ActionMetadata("custom", "11")
@Admin
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok({
      get: getActionMetadata(this.constructor as ObjectConstructor<Action>),
      custom: this.ctx.actionMetadata.custom,
      admin: this.ctx.actionMetadata.admin,
    });
  }
}
