import "@sfajs/core";
import {
  HttpContext,
  ObjectConstructor,
  QueryDict,
  ReadonlyQueryDict,
  Startup,
  StatusCodes,
} from "@sfajs/core";
import Action from "./action";
import MapParser from "./map/map-parser";
import path = require("path");
import MapItem from "./map/map-item";
import RouterConfig from "./router-config";
import { DEFAULT_ACTION_DIR } from "./constant";

export { Action, MapItem, RouterConfig };

export { ActionMetadata, defineActionMetadata } from "./decorators";

declare module "@sfajs/core" {
  interface Startup {
    useRouterParser(cfg?: RouterConfig): this;
    useRouter(cfg?: RouterConfig): this;
  }

  interface SfaRequest {
    readonly params: ReadonlyQueryDict;
  }

  interface HttpContext {
    readonly actionMetadata: MapItem;
  }
}

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
      (this as any).routerConfig.dir,
      ctx.actionMetadata.path
    );
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(filePath).default as ObjectConstructor<Action>;
  });

  return this;
};

function initRouter(startup: Startup, cfg: RouterConfig) {
  if (!(startup as any).routerConfig) {
    if (!cfg) cfg = {};
    cfg.dir =
      cfg.dir?.replace(/^\//, "").replace(/\/$/, "") ?? DEFAULT_ACTION_DIR;
    cfg.prefix = cfg.prefix?.replace(/^\//, "").replace(/\/$/, "") ?? "";
    (startup as any).routerConfig = cfg;
  }

  startup.use(async (ctx, next) => {
    if (parseRouter(startup, ctx)) {
      await next();
    }
  });
}

function parseRouter(startup: Startup, ctx: HttpContext): boolean {
  const cfg: RouterConfig = (startup as any).routerConfig;
  const mapParser = new MapParser(ctx, cfg);
  if (mapParser.notFound) {
    ctx.notFoundMsg({
      message: `Can't find the path：${ctx.req.path}`,
      path: ctx.req.path,
    });
    return false;
  }
  if (mapParser.methodNotAllowed) {
    ctx.res.body = {
      message: `method not allowed：${ctx.req.method}`,
      method: ctx.req.method,
      path: ctx.req.path,
    };
    ctx.res.status = StatusCodes.METHOD_NOT_ALLOWED;
    return false;
  }
  const mapItem = mapParser.mapItem;

  (ctx as any).actionMetadata = mapItem;
  (ctx.req as any).params = {};

  if (mapItem.path.includes("^")) {
    const mapPathStrs = mapItem.reqPath.split("/");
    const reqPathStrs = ctx.req.path.split("/");
    for (let i = 0; i < Math.min(mapPathStrs.length, reqPathStrs.length); i++) {
      const mapPathStr = mapPathStrs[i];
      if (!mapPathStr.startsWith("^")) continue;
      const reqPathStr = reqPathStrs[i];

      const key = mapPathStr.substring(1, mapPathStr.length);
      const value = decodeURIComponent(reqPathStr);

      const params = ctx.req.params as QueryDict;
      params[key] = value;
    }
  }

  return true;
}
