import { Action } from "../../../src";

export default class extends Action {
  async invoke() {
    this.ok({
      method: "GET",
    });
  }
}
