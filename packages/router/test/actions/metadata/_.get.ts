import { Dict, ObjectConstructor } from "@sfajs/core";
import { Action, getActionMetadata, setActionMetadata } from "../../../src";

function CustomMetadata(metadata: Dict) {
  return function (target: any) {
    setActionMetadata(target, metadata);
  };
}

function Admin(target: any) {
  setActionMetadata(target, {
    admin: true,
  });
}

@CustomMetadata({
  custom: "11",
})
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
