import { Configuration, defineConfig } from "@sfajs/cli";

export default defineConfig(() => {
  return <Configuration>{
    router: {
      dir: "actions1",
    },
  };
});
