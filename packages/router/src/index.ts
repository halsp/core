import "@sfajs/core";
import {
  HttpContext,
  MethodNotAllowedException,
  NotFoundException,
  ObjectConstructor,
  QueryDict,
  ReadonlyQueryDict,
  SfaRequest,
  Startup,
} from "@sfajs/core";
import Action from "./action";
import MapParser from "./map/map-parser";
import path = require("path");
import MapItem from "./map/map-item";
import RouterConfig from "./router-config";
import {
  CTX_CACHE_METADATA,
  DEFAULT_ACTION_DIR,
  HTTP_CONTEXT_STARTUP,
  REQUEST_CACHE_PARAMS,
  REQUEST_HTTP_CONTEXT,
  STARTUP_ROUTER_CONFIG,
} from "./constant";

export { Action, MapItem, RouterConfig };

export {
  SetActionMetadata,
  setActionMetadata,
  getActionMetadata,
} from "./decorators";

declare module "@sfajs/core" {
  interface Startup {
    useRouterParser(cfg?: RouterConfig): this;
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

    const cfg: RouterConfig = ctx[HTTP_CONTEXT_STARTUP][STARTUP_ROUTER_CONFIG];
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
    const actionMetadata: MapItem = req[REQUEST_HTTP_CONTEXT].actionMetadata;
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

Startup.prototype.useRouterParser = function <T extends Startup>(
  cfg: RouterConfig = {}
): T {
  initRouter(this, cfg);
  return this as T;
};

Startup.prototype.useRouter = function (cfg: RouterConfig = {}): Startup {
  initRouter(this, cfg);

  this.add((ctx) => {
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

function initRouter(startup: Startup, cfg: RouterConfig) {
  if (startup[STARTUP_ROUTER_CONFIG]) {
    return;
  }

  if (!cfg) cfg = {};
  cfg.dir =
    cfg.dir?.replace(/^\//, "").replace(/\/$/, "") ?? DEFAULT_ACTION_DIR;
  cfg.prefix = cfg.prefix?.replace(/^\//, "").replace(/\/$/, "") ?? "";
  startup[STARTUP_ROUTER_CONFIG] = cfg;

  startup.use(async (ctx, next) => {
    ctx.req[REQUEST_HTTP_CONTEXT] = ctx;
    ctx[HTTP_CONTEXT_STARTUP] = startup;
    await next();
  });
}
