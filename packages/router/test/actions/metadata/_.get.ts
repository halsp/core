import { Dict } from "@sfajs/core";
import { Action, defineActionMetadata } from "../../../src";

function CustomMetadata(metadata: Dict) {
  return function (target: any) {
    defineActionMetadata(target, metadata);
  };
}

function Admin(target: any) {
  defineActionMetadata(target, {
    admin: true,
  });
}

@CustomMetadata({
  custom: "11",
})
@Admin
export default class extends Action {
  async invoke(): Promise<void> {
    //
  }
}
