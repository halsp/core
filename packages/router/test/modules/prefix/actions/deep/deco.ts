import { Action, HttpPost } from "../../../../../src";

@HttpPost("deep-deco")
export class DecoAction extends Action {
  async invoke() {
    this.ctx.set("module", true);
  }
}
