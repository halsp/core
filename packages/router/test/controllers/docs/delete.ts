import { Action } from "../../../src";

/**
 * @action delete docs
 *
 * a docs test named delete
 *
 * @parts test1 test2 custom
 * @input
 * @@headers
 * @@@test-header1 {string} a test header of deleting docs NO.1
 * @@@test-header2 {number}
 * @@@test-header3 {object} a test header of deleting docs NO.3
 * @@@@test-header31 {string} a test header of deleting docs NO.3.1
 * @@@@test-header32 {number} a test header of deleting docs NO.3.2
 * @@@test-header4 a test header of deleting docs NO.4
 * @@@test-header5 {number} a test header of deleting docs NO.5
 * @@body {object} ok result
 * @@@method {string} http method
 * @@params
 * @@query
 * @output
 * @@codes
 * @@@200 success
 * @@@404
 * @@body
 * @@@method {string} http method
 */
export default class extends Action {
  async invoke(): Promise<void> {
    this.ok({
      method: "DELETE",
    });

    // this.ok("DELETE");
  }
}
