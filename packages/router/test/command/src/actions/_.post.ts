import { Action } from "@sfajs/router-act";

export default class extends Action {
  async invoke(): Promise<void> {
    this.ok({
      method: "POST",
    });
  }
}
