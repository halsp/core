import { Action } from "@sfajs/mva";

export default class extends Action {
  async invoke(): Promise<void> {
    this.ok("GET");
  }
}
