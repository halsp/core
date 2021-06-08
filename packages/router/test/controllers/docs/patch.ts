import { Action } from "../../../src";

/**
 * @action patch docs
 *
 * a docs test named patch
 *
 * @parts
 * @input input desc
 * @@headers
 * @@params
 * @@query
 * @@body
 * @output out desc
 * @@headers
 * @@body
 * @@codes
 */
export default class extends Action {
  constructor() {
    super([]);
  }

  async invoke(): Promise<void> {
    this.ok({
      method: "PATCH",
    });
  }
}
