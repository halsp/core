import { Action, MessagePattern } from "../../src";

@MessagePattern("abc:123")
export default class extends Action {
  invoke() {
    this.res.setBody("pattern-test");
  }
}
