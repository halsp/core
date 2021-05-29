const { Action } = require("sfa-router");

exports.default = class extends Action {
  async invoke() {
    this.ok("POST");
  }
};
