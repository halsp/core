import { ObjectConstructor } from "@sfajs/core";
import { Action, getActionMetadata, SetActionMetadata } from "../../../src";

const Admin = SetActionMetadata("admin", true);

@SetActionMetadata("custom", "11")
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
