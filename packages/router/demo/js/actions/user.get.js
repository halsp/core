const { Action } = require("@sfajs/mva");

exports.default = class extends Action {
  async invoke() {
    this.ok("GET");
  }
};
