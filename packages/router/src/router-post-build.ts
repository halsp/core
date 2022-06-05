import { Postbuild } from "@sfajs/cli";
import { parseInject } from "@sfajs/inject";
import path from "path";
import * as fs from "fs";
import MapCreater from "./map/map-creater";
import { DEFAULT_ACTION_DIR, MAP_FILE_NAME } from "./constant";
import { TsconfigService } from "@sfajs/cli/dist/services/tsconfig.service";
import { ConfigService } from "@sfajs/cli/dist/services/config.service";
import RouterConfig from "./router-config";

export const routerPostBuild: Postbuild = async (ctx) => {
  const tsconfigService = await parseInject(ctx, TsconfigService);
  const configService = await parseInject(ctx, ConfigService);

  const config = configService.value;
  const cacheDir = tsconfigService.cacheDir;

  const routerDirPath = config.router?.dir ?? DEFAULT_ACTION_DIR;
  const routerDir = path.join(
    cacheDir,
    config.router?.dir ?? DEFAULT_ACTION_DIR
  );
  if (!fs.existsSync(routerDir) || !fs.statSync(routerDir).isDirectory()) {
    throw new Error("The router dir is not exist");
  }
  new MapCreater(routerDir).write(path.join(cacheDir, MAP_FILE_NAME));

  const routerConfig: RouterConfig = {
    dir: routerDirPath,
    customMethods: config.router?.customMethods ?? [],
    prefix: config.router?.prefix ?? "",
  };

  fs.writeFileSync(
    path.resolve(process.cwd(), cacheDir, "sfa-router-config.json"),
    JSON.stringify(routerConfig)
  );
};
