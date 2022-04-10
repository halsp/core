import { ObjectConstructor } from "@sfajs/core";
import {
  Action,
  getActionMetadata,
  SetActionMetadata,
  setActionMetadata,
} from "../../../src";

@SetActionMetadata("m1", 1)
export default class extends Action {
  async invoke(): Promise<void> {
    setActionMetadata(this, "m2", 2);
    setActionMetadata(this.constructor as ObjectConstructor<Action>, "m3", 3);
    this.ok({
      constructor: getActionMetadata(
        this.constructor as ObjectConstructor<Action>
      ),
      object: getActionMetadata(this),
      m1: getActionMetadata(this, "m1"),
    });
  }
}
