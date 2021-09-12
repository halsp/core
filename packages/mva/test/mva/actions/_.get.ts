import { Action } from "@sfajs/router-act";

export default class extends Action {
  async invoke(): Promise<void> {
    this.noContent();
  }
}
