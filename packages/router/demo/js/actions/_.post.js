const { Action } = require("@sfajs/router-act");

exports.default = class extends Action {
  async invoke() {
    this.ok("POST");
  }
};
