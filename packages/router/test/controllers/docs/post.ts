import { Action } from "../../../src";

export default class extends Action {
  constructor() {
    super([]);

    this.docs = {};
  }

  async invoke(): Promise<void> {
    this.ok({
      method: "POST",
    });
  }
}
