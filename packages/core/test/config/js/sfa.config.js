const { defineConfig } = require("../src");

module.exports = defineConfig(() => {
  return {
    customMethods: ["CUSTOM1", "CUSTOM2"],
  };
});
