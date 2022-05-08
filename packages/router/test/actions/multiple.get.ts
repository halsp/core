import { Action, HttpPost, HttpPut } from "../../src";

export default class extends Action {
  async invoke(): Promise<void> {
    this.ok("multiple-default");
  }
}

export class test1 extends Action {
  async invoke(): Promise<void> {
    this.ok("multiple-test");
  }
}

@HttpPost
export class test2 extends Action {
  async invoke(): Promise<void> {
    this.ok("multiple-post");
  }
}

@HttpPut("//path")
export class test3 extends Action {
  async invoke(): Promise<void> {
    this.ok("multiple-path");
  }
}
