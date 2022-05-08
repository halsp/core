import { Action, HttpPut } from "../../../src";

@HttpPut("mu")
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok("method");
  }
}
