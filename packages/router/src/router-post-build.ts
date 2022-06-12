import path from "path";
import * as fs from "fs";
import MapCreater from "./map/map-creater";
import { DEFAULT_ACTION_DIR } from "./constant";
import { RouterDistConfig } from "./router-config";
import { Postbuild } from "@sfajs/cli-common";

export const routerPostBuild: Postbuild = async ({ config, cacheDir }) => {
  const routerDirPath = config.router?.dir ?? DEFAULT_ACTION_DIR;
  const routerDir = path.join(
    cacheDir,
    config.router?.dir ?? DEFAULT_ACTION_DIR
  );
  if (!fs.existsSync(routerDir) || !fs.statSync(routerDir).isDirectory()) {
    throw new Error("The router dir is not exist");
  }

  const map = new MapCreater(routerDir).map;
  const routerConfig: RouterDistConfig = {
    dir: routerDirPath,
    customMethods: config.router?.customMethods ?? [],
    prefix: config.router?.prefix ?? "",
    map: map,
  };

  fs.writeFileSync(
    path.resolve(process.cwd(), cacheDir, "sfa-router-config.json"),
    JSON.stringify(routerConfig)
  );
};
