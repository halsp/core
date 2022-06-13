import path from "path";
import * as fs from "fs";
import MapCreater from "./map/map-creater";
import { CONFIG_FILE_NAME, DEFAULT_ACTION_DIR } from "./constant";
import { RouterDistConfig } from "./router-config";
import { Postbuild } from "@sfajs/cli-common";

export const postbuild: Postbuild = async ({ config, cacheDir }) => {
  const routerDirPath = config.routerDir ?? DEFAULT_ACTION_DIR;
  const routerDir = path.join(cacheDir, config.routerDir ?? DEFAULT_ACTION_DIR);
  if (!fs.existsSync(routerDir) || !fs.statSync(routerDir).isDirectory()) {
    throw new Error("The router dir is not exist");
  }

  const map = new MapCreater(routerDir).map;
  const routerConfig: RouterDistConfig = {
    dir: routerDirPath,
    map: map.map((m) => m.plainObject),
  };

  fs.writeFileSync(
    path.resolve(process.cwd(), cacheDir, CONFIG_FILE_NAME),
    JSON.stringify(routerConfig)
  );
};
