const { defineConfig } = require("../src");

module.exports = defineConfig(() => {
  return {
    customMethods: ["CUSTOMJS"],
  };
});
