import { Action, MicroPattern } from "../../src";

@MicroPattern("event:123")
export class EventPatternAction extends Action {
  invoke() {
    this.res.setBody("event-pattern-test");
  }
}

@MicroPattern("message:123")
export class MessagePatternAction extends Action {
  invoke() {
    this.res.setBody("message-pattern-test");
  }
}

@MicroPattern("multi:123")
@MicroPattern("multi:123")
export class MultiPatternAction extends Action {
  invoke() {
    this.res.setBody("multi-pattern-test");
  }
}
