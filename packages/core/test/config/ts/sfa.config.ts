// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require("../src");

export default defineConfig((mode) => {
  return {
    mode: mode,
    customMethods: ["CUSTOMTS"],
  };
});
