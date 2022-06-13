import path from "path";
import * as fs from "fs";
import MapCreater from "./map/map-creater";
import { CONFIG_FILE_NAME, DEFAULT_ACTION_DIR } from "./constant";
import { RouterDistOptions } from "./router-options";
import { Postbuild } from "@sfajs/cli-common";

export const postbuild: Postbuild = async ({ config, cacheDir }) => {
  const routerDirPath = config.routerActionsDir ?? DEFAULT_ACTION_DIR;
  const routerDir = path.join(
    cacheDir,
    config.routerActionsDir ?? DEFAULT_ACTION_DIR
  );
  if (!fs.existsSync(routerDir) || !fs.statSync(routerDir).isDirectory()) {
    throw new Error("The router dir is not exist");
  }

  const map = new MapCreater(routerDir).map;
  const routerConfig: RouterDistOptions = {
    dir: routerDirPath,
    map: map.map((m) => m.plainObject),
  };

  fs.writeFileSync(
    path.resolve(process.cwd(), cacheDir, CONFIG_FILE_NAME),
    JSON.stringify(routerConfig)
  );
};
