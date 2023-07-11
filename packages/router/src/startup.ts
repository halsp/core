import { Context, Startup } from "@halsp/core";
import MapParser from "./map/map-parser";
import path = require("path");
import {
  RouterDistOptions,
  RouterOptions,
  RouterOptionsMerged,
} from "./router-options";
import {
  CONFIG_FILE_NAME,
  DEFAULT_ACTION_DIR,
  DEFAULT_MODULES_DIR,
  HALSP_ROUTER_DIR,
} from "./constant";
import * as fs from "fs";

export function initRouterMap(this: Startup, options?: RouterOptions) {
  const mapOptions = readMap();
  const opts: RouterOptionsMerged = {
    map: mapOptions?.map,
    dir: getDir(mapOptions?.dir),
    prefix: options?.prefix,
    decorators: options?.decorators,
  };

  const routerMap = new MapParser(opts).getMap();
  Object.defineProperty(this, "routerMap", {
    configurable: true,
    enumerable: false,
    get: () => {
      return routerMap;
    },
  });

  Object.defineProperty(this, "routerOptions", {
    configurable: true,
    enumerable: false,
    get: () => {
      return opts;
    },
  });

  routerMap.forEach((item) => {
    const url = (options?.prefix ?? "") + item.url;
    const methods = item.methods.join(",");
    const pattern = methods ? methods + "//" + url : url;

    this.register(pattern, (ctx: Context) => {
      Object.defineProperty(ctx, "actionMetadata", {
        configurable: true,
        enumerable: false,
        get: () => {
          return item;
        },
      });
    });
  });

  return this.use(async (ctx, next) => {
    Object.defineProperty(ctx, "routerMap", {
      configurable: true,
      enumerable: false,
      get: () => {
        return routerMap;
      },
    });

    Object.defineProperty(ctx, "routerOptions", {
      configurable: true,
      enumerable: false,
      get: () => {
        return opts;
      },
    });

    await next();
  });
}

function readMap(): RouterDistOptions | undefined {
  const filePath = path.resolve(CONFIG_FILE_NAME);
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const txt = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(txt);
}

function getDir(dir?: string) {
  if (process.env[HALSP_ROUTER_DIR]) {
    return process.env[HALSP_ROUTER_DIR];
  } else if (dir) {
    return dir;
  } else if (fs.existsSync(DEFAULT_MODULES_DIR)) {
    return DEFAULT_MODULES_DIR;
  } else {
    return DEFAULT_ACTION_DIR;
  }
}
