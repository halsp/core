import { Action, ActionMetadata } from "../../../src";

@ActionMetadata("modules-first", 1)
export default class extends Action {
  async invoke() {
    this.ok({
      modules: true,
    });
  }
}
