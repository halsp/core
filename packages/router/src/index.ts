import "sfa";
import { HttpContext, QueryDict, ReadonlyQueryDict, Startup } from "sfa";
import Action from "./Action";
import MapParser from "./Map/MapParser";
import path = require("path");
import Constant from "./Constant";
import MapItem from "./Map/MapItem";
import { StatusCodes } from "@sfajs/header";

export { Action, MapItem };

declare module "sfa" {
  interface Startup {
    useRouter(): this;
    useRouterParser(dir?: string, prefix?: string): this;
  }

  interface SfaRequest {
    readonly params: ReadonlyQueryDict;
  }

  interface HttpContext {
    readonly routerMapItem: MapItem;
    readonly routerMap: MapItem[];
  }
}

Startup.prototype.useRouter = function (): Startup {
  return this.use(async (ctx, next) => {
    if (ctx.bag<string>("ROUTER_DIR") == undefined) {
      setConfig(ctx, Constant.defaultRouterDir, "");
    }
    if (!ctx.routerMapItem) {
      if (!parseRouter(ctx)) return;
    }
    await next();
  }).add((ctx) => {
    const filePath = path.join(
      process.cwd(),
      ctx.bag<string>("ROUTER_DIR"),
      ctx.routerMapItem.path
    );
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const actionClass = require(filePath).default;
    return new actionClass() as Action;
  });
};

Startup.prototype.useRouterParser = function <T extends Startup>(
  dir = Constant.defaultRouterDir,
  prefix = ""
): T {
  return this.use(async (ctx, next) => {
    setConfig(ctx, dir, prefix);
    if (!ctx.routerMapItem) {
      if (!parseRouter(ctx)) return;
    }
    await next();
  }) as T;
};

function setConfig(ctx: HttpContext, dir: string, prefix: string) {
  ctx.bag("ROUTER_DIR", dir.replace(/^\//, "").replace(/\/$/, ""));
  ctx.bag("ROUTER_PREFIX", prefix.replace(/^\//, "").replace(/\/$/, ""));
}

function parseRouter(ctx: HttpContext): boolean {
  const mapParser = new MapParser(ctx);
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
