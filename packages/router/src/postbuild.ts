import path from "path";
import * as fs from "fs";
import MapCreater from "./map/map-creater";
import {
  CONFIG_FILE_NAME,
  DEFAULT_ACTION_DIR,
  DEFAULT_MODULES_DIR,
} from "./constant";
import { RouterDistOptions } from "./router-options";

export const postbuild = async ({ config, cacheDir }) => {
  const routerDirPath = config.routerActionsDir ?? getDefaultDir(cacheDir);
  const routerDir = path.join(cacheDir, routerDirPath);
  if (!fs.existsSync(routerDir) || !fs.statSync(routerDir).isDirectory()) {
    throw new Error("The router dir is not exist");
  }

  const map = new MapCreater(routerDir).create();
  const routerConfig: RouterDistOptions = {
    dir: routerDirPath,
    map: map.map((m) => m.plainObject),
  };

  await fs.promises.writeFile(
    path.resolve(process.cwd(), cacheDir, CONFIG_FILE_NAME),
    JSON.stringify(routerConfig)
  );
};

function getDefaultDir(parent: string) {
  if (fs.existsSync(path.join(parent, DEFAULT_MODULES_DIR))) {
    return DEFAULT_MODULES_DIR;
  } else {
    return DEFAULT_ACTION_DIR;
  }
}
