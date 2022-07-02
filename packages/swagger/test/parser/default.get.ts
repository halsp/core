import { Action } from "@sfajs/router";

export default class extends Action {
  invoke() {
    this.ok();
  }
}
