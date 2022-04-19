import { Action } from "../../../src";

export default class extends Action {
  async invoke(): Promise<void> {
    this.ok({
      method: "GET",
      id1: this.ctx.req.params.id,
      id2: (this.ctx.req as any).param.id,
    });
  }
}
