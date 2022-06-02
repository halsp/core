import { defineConfig } from "@sfajs/cli";
import { routerPostBuild } from "@sfajs/router";

export default defineConfig(() => {
  return {
    build: {
      assets: ["static/**", "static.txt"],
      postbuild: [routerPostBuild],
    },
  };
});
