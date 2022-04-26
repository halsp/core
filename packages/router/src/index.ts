import "@sfajs/core";
import {
  HookType,
  HttpContext,
  MethodNotAllowedException,
  NotFoundException,
  ObjectConstructor,
  QueryDict,
  ReadonlyQueryDict,
  SfaRequest,
  Startup,
} from "@sfajs/core";
import { Action } from "./action";
import MapParser from "./map/map-parser";
import path = require("path");
import MapItem from "./map/map-item";
import RouterConfig from "./router-config";
import {
  CTX_CACHE_METADATA,
  DEFAULT_ACTION_DIR,
  REQUEST_CACHE_PARAMS,
  STARTUP_ROUTER_CONFIG,
} from "./constant";
import {
  ActionFilter,
  AuthorizationFilter,
  ExceptionFilter,
  getFilters,
  isActionFilter,
  isAuthorizationFilter,
  isExceptionFilter,
  isResourceFilter,
  ResourceFilter,
} from "./filters";

export { Action, MapItem, RouterConfig };
export { SetActionMetadata } from "./decorators";
export { setActionMetadata, getActionMetadata } from "./action";
export {
  Filter,
  ActionFilter,
  AuthorizationFilter,
  ExceptionFilter,
  ResourceFilter,
} from "./filters";

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

Object.defineProperty(HttpContext.prototype, "actionMetadata", {
  configurable: false,
  enumerable: false,
  get: function () {
    const ctx = this as HttpContext;
    if (ctx[CTX_CACHE_METADATA]) {
      return ctx[CTX_CACHE_METADATA];
    }

    const cfg: RouterConfig = this.startup[STARTUP_ROUTER_CONFIG];
    const mapParser = new MapParser(ctx, cfg);
    if (mapParser.notFound) {
      throw new NotFoundException({
        message: `Can't find the path：${ctx.req.path}`,
        path: ctx.req.path,
      });
    }
    if (mapParser.methodNotAllowed) {
      throw new MethodNotAllowedException({
        message: `method not allowed：${ctx.req.method}`,
        method: ctx.req.method,
        path: ctx.req.path,
      });
    }
    const mapItem = mapParser.mapItem;
    ctx[CTX_CACHE_METADATA] = mapItem;
    return mapItem;
  },
});

Object.defineProperty(SfaRequest.prototype, "params", {
  configurable: false,
  enumerable: false,
  get: function () {
    const req = this as SfaRequest;
    if (req[REQUEST_CACHE_PARAMS]) {
      return req[REQUEST_CACHE_PARAMS];
    }

    const params: QueryDict = {};
    const actionMetadata: MapItem = req.ctx.actionMetadata;
    if (actionMetadata.path.includes("^")) {
      const mapPathStrs = actionMetadata.reqPath.split("/");
      const reqPathStrs = req.path.split("/");
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
    req[REQUEST_CACHE_PARAMS] = params;
    return params;
  },
});
Object.defineProperty(SfaRequest.prototype, "param", {
  configurable: false,
  enumerable: false,
  get: function () {
    const req = this as SfaRequest;
    return req.params;
  },
});

Startup.prototype.useRouter = function (cfg: RouterConfig = {}): Startup {
  if (!!this[STARTUP_ROUTER_CONFIG]) {
    return this;
  }

  if (!cfg) cfg = {};
  cfg.dir =
    cfg.dir?.replace(/^\//, "").replace(/\/$/, "") ?? DEFAULT_ACTION_DIR;
  cfg.prefix = cfg.prefix?.replace(/^\//, "").replace(/\/$/, "") ?? "";
  this[STARTUP_ROUTER_CONFIG] = cfg;

  this.hook(HookType.Exception, async (ctx, md, err) => {
    if (!(md instanceof Action)) return false;

    const filters = getFilters<ExceptionFilter>(md, isExceptionFilter);
    for (const filter of filters) {
      const execResult = await filter.onException(ctx, err);
      if (typeof execResult == "boolean" && execResult) {
        return true;
      }
    }
    return false;
  })
    .hook(HookType.BeforeInvoke, async (ctx, md) => {
      if (!(md instanceof Action)) return;

      {
        const filters = getFilters<AuthorizationFilter>(
          md,
          isAuthorizationFilter
        );
        for (const filter of filters) {
          const execResult = await filter.onAuthorization(ctx);
          if (typeof execResult == "boolean" && !execResult) {
            return false;
          }
        }
      }

      {
        const filters = getFilters<ResourceFilter>(md, isResourceFilter);
        for (const filter of filters) {
          const execResult = await filter.onResourceExecuting(ctx);
          if (typeof execResult == "boolean" && !execResult) {
            return false;
          }
        }
      }

      {
        const filters = getFilters<ActionFilter>(md, isActionFilter);
        for (const filter of filters) {
          const execResult = await filter.onActionExecuting(ctx);
          if (typeof execResult == "boolean" && !execResult) {
            return false;
          }
        }
      }

      return true;
    })
    .hook(HookType.AfterInvoke, async (ctx, md) => {
      if (!(md instanceof Action)) return;

      {
        const filters = getFilters<ActionFilter>(md, isActionFilter);
        for (const filter of filters) {
          await filter.onActionExecuted(ctx);
        }
      }

      {
        const filters = getFilters<ResourceFilter>(md, isResourceFilter);
        for (const filter of filters) {
          await filter.onResourceExecuted(ctx);
        }
      }
    })
    .add((ctx) => {
      const filePath = path.join(
        process.cwd(),
        this[STARTUP_ROUTER_CONFIG].dir,
        ctx.actionMetadata.path
      );
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(filePath).default as ObjectConstructor<Action>;
    });

  return this;
};
