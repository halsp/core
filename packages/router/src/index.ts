import "@sfajs/core";
import {
  ObjectConstructor,
  QueryDict,
  ReadonlyQueryDict,
  Startup,
} from "@sfajs/core";
import { Action } from "./action";
import MapParser from "./map/map-parser";
import path = require("path");
import MapItem from "./map/map-item";
import {
  RouterDistConfig,
  RouterConfig,
  RouterConfigMerged,
} from "./router-config";
import {
  CONFIG_FILE_NAME,
  CTX_CACHE_METADATA,
  DEFAULT_ACTION_DIR,
  REQUEST_CACHE_PARAMS,
  STARTUP_ROUTER_CONFIG,
} from "./constant";
import * as fs from "fs";
import { BlanlMiddleware } from "./blank.middleware";

export { Action, MapItem, RouterConfig };
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

declare module "@sfajs/core" {
  interface Startup {
    useRouter(cfg?: RouterConfig): this;
  }

  interface SfaRequest {
    get params(): ReadonlyQueryDict;
  }

  interface HttpContext {
    get actionMetadata(): MapItem;
  }
}

declare module "@sfajs/cli-common" {
  interface Configuration {
    routerDir?: string;
  }
}

Startup.prototype.useRouter = function (cfg?: RouterConfig): Startup {
  if (!!this[STARTUP_ROUTER_CONFIG]) {
    return this;
  }

  const cliCfg = readConfig();
  const config: RouterConfigMerged = {
    map: cliCfg?.map,
    dir: cfg?.dir ?? cliCfg?.dir ?? DEFAULT_ACTION_DIR,
    prefix: cfg?.prefix,
    customMethods: cfg?.customMethods,
  };
  this[STARTUP_ROUTER_CONFIG] = config;

  return this.use(async (ctx, next) => {
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
      const cfg: RouterConfigMerged = this[STARTUP_ROUTER_CONFIG];
      const mapParser = new MapParser(ctx, cfg);
      if (mapParser.notFound) {
        ctx.notFoundMsg({
          message: `Can't find the path：${ctx.req.path}`,
          path: ctx.req.path,
        });
      } else if (mapParser.methodNotAllowed) {
        ctx.methodNotAllowedMsg({
          message: `method not allowed：${ctx.req.method}`,
          method: ctx.req.method,
          path: ctx.req.path,
        });
      } else {
        const mapItem = mapParser.mapItem;
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
      if (actionMetadata.path.includes("^")) {
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
        return BlanlMiddleware;
      }

      const filePath = path.join(
        process.cwd(),
        this[STARTUP_ROUTER_CONFIG].dir,
        ctx.actionMetadata.path
      );

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const module = require(filePath);
      const action = module[ctx.actionMetadata.actionName];
      return action as ObjectConstructor<Action>;
    });
};

function readConfig(): RouterDistConfig | undefined {
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
