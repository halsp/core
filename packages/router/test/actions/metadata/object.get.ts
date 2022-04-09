import { ObjectConstructor } from "@sfajs/core";
import {
  Action,
  ActionMetadata,
  getActionMetadata,
  setActionMetadata,
} from "../../../src";

@ActionMetadata({
  m1: "1",
})
export default class extends Action {
  async invoke(): Promise<void> {
    setActionMetadata(this, {
      m2: "2",
    });
    setActionMetadata(this.constructor as ObjectConstructor<Action>, {
      m3: "3",
    });
    this.ok({
      constructor: getActionMetadata(
        this.constructor as ObjectConstructor<Action>
      ),
      object: getActionMetadata(this),
    });
  }
}
