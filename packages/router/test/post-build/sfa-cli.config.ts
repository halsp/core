import { defineConfig } from "@sfajs/cli";
import "../src";

export default defineConfig(() => {
  return {
    router: {
      dir: "actions",
      prefix: "",
    },
  };
});
