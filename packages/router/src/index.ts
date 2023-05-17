import { Context, Dict, isFunction, ReadonlyDict, Startup } from "@halsp/core";
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
  PARSER_USED,
  TEST_ACTION_DIR,
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
    useRouterParser(options?: RouterOptions): this;
    get routerMap(): MapItem[];
    get routerOptions(): RouterInitedOptions;
  }

  interface Context {
    get actionMetadata(): MapItem;
    get routerMap(): MapItem[];
    get routerOptions(): RouterInitedOptions;
  }

  interface Request {
    get params(): ReadonlyDict<string>;
  }
}

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useRouter = function (options?: RouterOptions) {
  if (usedMap.get(this)) return this;
  usedMap.set(this, true);

  return this.useRouterParser(options).add((ctx) => {
    if (!ctx.actionMetadata) {
      return BlankMiddleware;
    } else {
      return ctx.actionMetadata.getAction(ctx.routerOptions.dir);
    }
  });
};

Startup.prototype.useRouterParser = function (options?: RouterOptions) {
  if (this[PARSER_USED]) {
    return this;
  }
  this[PARSER_USED] = true;

  const mapOptions = readMap();
  const opts: RouterOptionsMerged = {
    map: mapOptions?.map,
    dir: this[TEST_ACTION_DIR] ?? mapOptions?.dir ?? DEFAULT_ACTION_DIR,
    prefix: options?.prefix,
    customMethods: options?.customMethods,
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

  if (
    process.env.HALSP_ENV == "micro" &&
    "register" in this &&
    isFunction(this["register"])
  ) {
    routerMap.forEach((item) => {
      this["register"]((options?.prefix ?? "") + item.url, (ctx: Context) => {
        Object.defineProperty(ctx, "actionMetadata", {
          configurable: true,
          enumerable: false,
          get: () => {
            return item;
          },
        });
      });
    });
  }

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
  })
    .use(async (ctx, next) => {
      if (process.env.HALSP_ENV != "http") {
        return await next();
      }
      if (!!ctx.actionMetadata) {
        return await next();
      }

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { MapMatcher } = require("./map/http-map-matcher");
      const mapMatcher = new MapMatcher(ctx);
      if (mapMatcher.notFound) {
        ctx.res["notFoundMsg"]({
          message: `Can't find the path：${ctx.req.path}`,
          path: ctx.req.path,
        });
      } else if (mapMatcher.methodNotAllowed) {
        const method: string = ctx.req["method"];
        ctx.res["methodNotAllowedMsg"]({
          message: `method not allowed：${method}`,
          method: method,
          path: ctx.req.path,
        });
      } else {
        const mapItem = mapMatcher.mapItem;
        Object.defineProperty(ctx, "actionMetadata", {
          configurable: true,
          enumerable: false,
          get: () => {
            return mapItem;
          },
        });
      }
      await next();
    })
    .use(async (ctx, next) => {
      if (!ctx.actionMetadata) {
        return await next();
      }

      const params: Dict<string> = {};
      const actionMetadata: MapItem = ctx.actionMetadata;
      if (actionMetadata.url.includes("^")) {
        const mapPathStrs = actionMetadata.url
          .split("/")
          .filter((item) => !!item);
        const reqPathStrs = ctx.req.path.split("/").filter((item) => !!item);
        for (
          let i = 0;
          i < Math.min(mapPathStrs.length, reqPathStrs.length);
          i++
        ) {
          const mapPathStr = mapPathStrs[i];
          if (!mapPathStr.startsWith("^")) continue;
          const reqPathStr = reqPathStrs[i];

          const key = mapPathStr.substring(1, mapPathStr.length);
          const value = decodeURIComponent(reqPathStr);

          params[key] = value;
        }
      }

      Object.defineProperty(ctx.req, "params", {
        configurable: true,
        enumerable: false,
        get: () => {
          return params;
        },
      });
      Object.defineProperty(ctx.req, "param", {
        configurable: true,
        enumerable: false,
        get: () => {
          return params;
        },
      });

      await next();
    });
};

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
