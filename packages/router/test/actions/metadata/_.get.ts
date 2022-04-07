import { Dict } from "@sfajs/core";
import { Action, defineRouterMetadata } from "../../../src";

function CustomMetadata(metadata: Dict) {
  return function (target: any) {
    defineRouterMetadata(target, metadata);
  };
}

function Admin(target: any) {
  defineRouterMetadata(target, {
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
