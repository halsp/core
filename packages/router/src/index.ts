import { Context, Startup } from "@halsp/core";
import { Action } from "./action";
import MapParser from "./map/map-parser";
import path = require("path");
import MapItem from "./map/map-item";
import {
  RouterDistOptions,
  RouterInitedOptions,
  RouterOptions,
  RouterOptionsMerged,
} from "./router-options";
import {
  CONFIG_FILE_NAME,
  DEFAULT_ACTION_DIR,
  HALSP_ROUTER_DIR,
} from "./constant";
import * as fs from "fs";
import { BlankMiddleware } from "./blank.middleware";

export { Action, MapItem, RouterOptions, RouterInitedOptions };
export {
  ActionMetadata,
  SetActionMetadata,
  HttpCustom,
  HttpConnect,
  HttpDelete,
  HttpGet,
  HttpHead,
  HttpOptions,
  HttpPatch,
  HttpPost,
  HttpPut,
  HttpTrace,
  HttpCopy,
  HttpLink,
  HttpMove,
  HttpUnlink,
  HttpWrapped,
  setActionMetadata,
  getActionMetadata,
  MicroPattern,
} from "./action";
export { postbuild } from "./postbuild";

declare module "@halsp/core" {
  interface Startup {
    useRouter(options?: RouterOptions): this;
    get routerMap(): MapItem[];
    get routerOptions(): RouterInitedOptions;
  }

  interface Context {
    get actionMetadata(): MapItem;
    get routerMap(): MapItem[];
    get routerOptions(): RouterInitedOptions;
  }
}

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useRouter = function (options?: RouterOptions) {
  if (usedMap.get(this)) return this;
  usedMap.set(this, true);

  return initRouterMap.call(this, options).add((ctx) => {
    if (!ctx.actionMetadata) {
      return BlankMiddleware;
    } else {
      return ctx.actionMetadata.getAction(ctx.routerOptions.dir);
    }
  });
};

function initRouterMap(this: Startup, options?: RouterOptions) {
  const mapOptions = readMap();
  const opts: RouterOptionsMerged = {
    map: mapOptions?.map,
    dir: process.env[HALSP_ROUTER_DIR] ?? mapOptions?.dir ?? DEFAULT_ACTION_DIR,
    prefix: options?.prefix,
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
  const filePath = path.join(process.cwd(), CONFIG_FILE_NAME);
  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  const txt = fs.readFileSync(
    path.join(process.cwd(), CONFIG_FILE_NAME),
    "utf-8"
  );
  return JSON.parse(txt);
}
