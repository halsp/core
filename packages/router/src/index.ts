import "@ipare/core";
import { QueryDict, ReadonlyQueryDict, Startup } from "@ipare/core";
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
  CTX_CACHE_METADATA,
  DEFAULT_ACTION_DIR,
  REQUEST_CACHE_PARAMS,
  STARTUP_ROUTER_MAP,
  STARTUP_ROUTER_OPTIONS,
  TEST_ACTION_DIR_BAG,
} from "./constant";
import * as fs from "fs";
import { BlankMiddleware } from "./blank.middleware";

export { Action, MapItem, RouterOptions, RouterInitedOptions };
export {
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
} from "./decorators";
export { setActionMetadata, getActionMetadata } from "./action";
export { postbuild } from "./postbuild";
import MapMatcher from "./map/map-matcher";

declare module "@ipare/core" {
  interface Startup {
    useRouter(options?: RouterOptions): this;
    get routerMap(): MapItem[];
    get routerOptions(): RouterInitedOptions;
  }

  interface Request {
    get params(): ReadonlyQueryDict;
  }

  interface HttpContext {
    get actionMetadata(): MapItem;
    get routerMap(): MapItem[];
    get routerOptions(): RouterInitedOptions;
  }
}

Startup.prototype.useRouter = function (options?: RouterOptions): Startup {
  if (!!this.routerOptions) {
    return this;
  }

  const mapOptions = readMap();
  const opts: RouterOptionsMerged = {
    map: mapOptions?.map,
    dir: this[TEST_ACTION_DIR_BAG] ?? mapOptions?.dir ?? DEFAULT_ACTION_DIR,
    prefix: options?.prefix,
    customMethods: options?.customMethods,
  };
  this[STARTUP_ROUTER_OPTIONS] = opts;

  this[STARTUP_ROUTER_MAP] = new MapParser(opts).getMap();

  Object.defineProperty(this, "routerMap", {
    configurable: false,
    enumerable: false,
    get: () => {
      return this[STARTUP_ROUTER_MAP];
    },
  });

  Object.defineProperty(this, "routerOptions", {
    configurable: false,
    enumerable: false,
    get: () => {
      return this[STARTUP_ROUTER_OPTIONS];
    },
  });

  return this.use(async (ctx, next) => {
    Object.defineProperty(ctx, "routerMap", {
      configurable: false,
      enumerable: false,
      get: () => {
        return this.routerMap;
      },
    });

    Object.defineProperty(ctx, "routerOptions", {
      configurable: false,
      enumerable: false,
      get: () => {
        return this.routerOptions;
      },
    });

    Object.defineProperty(ctx, "actionMetadata", {
      configurable: false,
      enumerable: false,
      get: () => {
        return ctx[CTX_CACHE_METADATA];
      },
    });

    Object.defineProperty(ctx.req, "params", {
      configurable: false,
      enumerable: false,
      get: () => {
        return ctx.req[REQUEST_CACHE_PARAMS];
      },
    });

    Object.defineProperty(ctx.req, "param", {
      configurable: false,
      enumerable: false,
      get: () => {
        return ctx.req.params;
      },
    });

    await next();
  })
    .use(async (ctx, next) => {
      const mapMatcher = new MapMatcher(ctx);
      if (mapMatcher.notFound) {
        ctx.notFoundMsg({
          message: `Can't find the path：${ctx.req.path}`,
          path: ctx.req.path,
        });
      } else if (mapMatcher.methodNotAllowed) {
        ctx.methodNotAllowedMsg({
          message: `method not allowed：${ctx.req.method}`,
          method: ctx.req.method,
          path: ctx.req.path,
        });
      } else {
        const mapItem = mapMatcher.mapItem;
        ctx[CTX_CACHE_METADATA] = mapItem;
      }
      await next();
    })
    .use(async (ctx, next) => {
      if (!ctx.actionMetadata) {
        return await next();
      }

      const params: QueryDict = {};
      const actionMetadata: MapItem = ctx.actionMetadata;
      if (actionMetadata.url.includes("^")) {
        const mapPathStrs = actionMetadata.url.split("/");
        const reqPathStrs = ctx.req.path.split("/");
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
      ctx.req[REQUEST_CACHE_PARAMS] = params;
      await next();
    })
    .add((ctx) => {
      if (!ctx.actionMetadata) {
        return BlankMiddleware;
      } else {
        return ctx.actionMetadata.getAction(opts.dir);
      }
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
