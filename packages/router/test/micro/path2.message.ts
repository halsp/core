import { Action } from "../../src";

export default class extends Action {
  invoke() {
    this.res.setBody("pattern-message-path-test");
  }
}
