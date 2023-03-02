import { Action } from "@halsp/router";

export default class extends Action {
  async invoke(): Promise<void> {
    this.noContent();
  }
}
