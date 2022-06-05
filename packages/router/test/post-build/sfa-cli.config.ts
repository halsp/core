import { defineConfig } from "@sfajs/cli";

export default defineConfig(() => {
  return {
    router: {
      dir: "actions",
      prefix: "",
      customMethods: ["cu"],
    },
  };
});
