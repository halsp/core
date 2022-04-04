import "@sfajs/core";
import {
  HttpContext,
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
import { ActionDecoratorParser } from "./decorators/action";

export { Action, MapItem, RouterConfig };

declare module "@sfajs/core" {
  interface Startup {
    useRouter<T extends this>(cfg?: RouterConfig): T;
  }

  interface SfaRequest {
    readonly params: ReadonlyQueryDict;
  }

  interface HttpContext {
    readonly routerMapItem: MapItem;
    readonly routerMap: MapItem[];
  }
}

Startup.prototype.useRouter = function <T extends Startup>(
  cfg: RouterConfig = {}
): T {
  cfg.dir =
    cfg.dir?.replace(/^\//, "").replace(/\/$/, "") ?? DEFAULT_ACTION_DIR;
  cfg.prefix = cfg.prefix?.replace(/^\//, "").replace(/\/$/, "") ?? "";

  this.use(async (ctx, next) => {
    if (parseRouter(ctx, cfg)) {
      await next();
    }
  });

  if (cfg.onParserAdded) {
    cfg.onParserAdded(this);
  }

  this.add((ctx) => {
    const filePath = path.join(
      process.cwd(),
      cfg.dir as string,
      ctx.routerMapItem.path
    );
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const actionClass = require(filePath).default;
    let action = new actionClass() as Action;
    action = new ActionDecoratorParser(ctx, action).parse();
    return action;
  });

  return this as T;
};

function parseRouter(ctx: HttpContext, cfg: RouterConfig): boolean {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx as any).routerMapItem = mapItem;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx as any).routerMap = mapParser.map;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx.req as any).params = {};

  if (mapItem.path.includes("^")) {
    const mapPathStrs = mapItem.reqPath.split("/");
    const reqPathStrs = ctx.req.path.split("/");
    for (let i = 0; i < Math.min(mapPathStrs.length, reqPathStrs.length); i++) {
      const mapPathStr = mapPathStrs[i];
      if (!mapPathStr.startsWith("^")) continue;
      const reqPathStr = reqPathStrs[i];

      const key = mapPathStr.substr(1, mapPathStr.length - 1);
      const value = decodeURIComponent(reqPathStr);

      const params = ctx.req.params as QueryDict;
      params[key] = value;
    }
  }

  return true;
}

export { Query, Param, Header, Body } from "./decorators";
