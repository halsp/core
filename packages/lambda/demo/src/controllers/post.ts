import { Action } from "sfa-router";

export default class extends Action {
  async invoke(): Promise<void> {
    this.ok("POST");
  }
}
