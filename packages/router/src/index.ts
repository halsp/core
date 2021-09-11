import "sfa";
import { HttpContext, QueryDict, ReadonlyQueryDict, Startup } from "sfa";
import Action from "./Action";
import MapParser from "./Map/MapParser";
import path = require("path");
import MapItem from "./Map/MapItem";
import { StatusCodes } from "@sfajs/header";
import * as linq from "linq";
import "@sfajs/views";
import RouterConfig from "./RouterConfig";
import MvaConfig from "./MvaConfig";
import Constant from "./Constant";

export { Action, MapItem, RouterConfig, MvaConfig };

declare module "sfa" {
  interface Startup {
    useRouter<T extends this>(cfg?: RouterConfig): T;
    useMva<T extends this>(cfg?: MvaConfig): T;
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
  cfg?: RouterConfig
): T {
  if (!cfg) cfg = {};
  cfg.dir =
    cfg.dir?.replace(/^\//, "").replace(/\/$/, "") ?? Constant.defaultRouterDir;
  cfg.prefix = cfg.prefix?.replace(/^\//, "").replace(/\/$/, "") ?? "";

  this.use(async (ctx, next) => {
    if (parseRouter(ctx, cfg as RouterConfig)) {
      await next();
    }
  });

  if (cfg?.onParserAdded) {
    cfg?.onParserAdded(this);
  }

  this.add((ctx) => {
    const filePath = path.join(
      process.cwd(),
      cfg?.dir as string,
      ctx.routerMapItem.path
    );
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const actionClass = require(filePath).default;
    return new actionClass() as Action;
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

Startup.prototype.useMva = function <T extends Startup>(
  cfg = <MvaConfig>{}
): T {
  this.use(async (ctx, next) => {
    await next();

    const body = ctx.res.body;
    const replaceCode = linq
      .from(cfg.codes ?? [])
      .where((code) => {
        if (typeof code == "number") {
          return code == ctx.res.status;
        } else {
          return code.code == ctx.res.status;
        }
      })
      .select((item) => {
        if (typeof item == "number") {
          return { path: item.toString(), replace: item };
        } else {
          return {
            path: item.code.toString(),
            replace: item.replace ?? item.code,
          };
        }
      })
      .firstOrDefault();
    if (replaceCode) {
      await ctx.view(replaceCode.path, body);
      ctx.res.status = replaceCode.replace;
      return;
    }

    if (ctx.res.isSuccess && ctx.routerMapItem != undefined) {
      await ctx.view(ctx.routerMapItem.reqPath, body);
    }
  });
  this.useViews(cfg.viewsDir, cfg.viewsOptions, cfg.viewsEngines);
  this.useRouter(cfg.routerConfig);

  return this as T;
};
