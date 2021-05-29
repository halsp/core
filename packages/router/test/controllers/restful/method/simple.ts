import { Action } from "../../../../src";

export default class extends Action {
  async invoke(): Promise<void> {
    this.ok({
      method: "ANY",
      action: "simple",
      realPath: this.realPath,
    });
  }
}
