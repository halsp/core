import { Action } from "@ipare/router";

export default class extends Action {
  async invoke(): Promise<void> {
    this.noContent();
  }
}
