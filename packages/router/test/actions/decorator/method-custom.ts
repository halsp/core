import { Action, HttpCustom } from "../../../src";

@HttpCustom("CUSTOM_DEC", "muc")
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok("method");
  }
}
