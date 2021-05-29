import { Action } from "../../../../src";

/**
 * @action get doc
 *
 * get a doc
 *
 * @parts test1 test2 custom
 * @input
 * @output
 */
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok({
      method: "GET",
    });
  }
}
