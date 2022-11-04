import { Startup } from "@ipare/core";
import type { QueryDict, ReadonlyQueryDict } from "@ipare/http";
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
  USED,
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
} from "./action";
export { postbuild } from "./postbuild";

declare module "@ipare/core" {
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
    get params(): ReadonlyQueryDict;
  }
}

Startup.prototype.useRouter = function (options?: RouterOptions) {
  if (this[USED]) {
    return this;
  }
  this[USED] = true;

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
      if (!process.env.IS_IPARE_MICRO) {
        return await next();
      }

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { MapMatcher } = require("./map/micro-map-matcher");
      const mapMatcher = new MapMatcher(ctx);
      if (mapMatcher.notFound) {
        ctx.res.setBody({
          status: "error",
          message: `Can't find the path: ${ctx.req.path}`,
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
      if (!process.env.IS_IPARE_HTTP) {
        return await next();
      }

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { MapMatcher } = require("./map/http-map-matcher");
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
      if (!ctx.req || !ctx.actionMetadata) {
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
