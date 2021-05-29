import { Action } from "../../../../../../src";

export default class extends Action {
  async invoke(): Promise<void> {
    this.ok({
      method: "POST",
      action: "query2/nextQuery",
      realPath: this.realPath,
    });
  }
}
