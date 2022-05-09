const { defineConfig } = require("../src");

exports.err = defineConfig(() => {
  return {
    customMethods: ["CUSTOM1", "CUSTOM2"],
  };
});
