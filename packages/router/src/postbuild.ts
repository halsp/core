import path from "path";
import * as fs from "fs";
import MapCreater from "./map/map-creater";
import {
  CONFIG_FILE_NAME,
  DEFAULT_ACTION_DIR,
  DEFAULT_MODULES_DIR,
  HALSP_ROUTER_DIR,
} from "./constant";
import { RouterDistOptions } from "./router-options";

export const HALSP_CLI_PLUGIN_POSTBUILD = async ({ cacheDir }) => {
  const routerDirPath = getDefaultDir(cacheDir);
  const routerDir = path.join(cacheDir, routerDirPath);

  const map = new MapCreater(routerDir).create();
  const routerConfig: RouterDistOptions = {
    dir: routerDirPath,
    map: map.map((m) => m.plainObject),
  };

  await fs.promises.writeFile(
    path.resolve(process.cwd(), cacheDir, CONFIG_FILE_NAME),
    JSON.stringify(routerConfig),
  );
};

function getDefaultDir(parent: string) {
  if (process.env[HALSP_ROUTER_DIR]) {
    return process.env[HALSP_ROUTER_DIR];
  } else if (fs.existsSync(path.join(parent, DEFAULT_MODULES_DIR))) {
    return DEFAULT_MODULES_DIR;
  } else {
    return DEFAULT_ACTION_DIR;
  }
}
