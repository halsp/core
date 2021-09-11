const { Action } = require("@sfajs/router");

exports.default = class extends Action {
  async invoke() {
    this.ok("POST");
  }
};
