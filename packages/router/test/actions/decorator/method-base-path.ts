import { Action, HttpGet } from "../../../src";

@HttpGet("//mup")
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok("method");
  }
}
