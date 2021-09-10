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
    useRouterParser(dir?: string, strict?: boolean): this;
  }

  interface SfaRequest {
    readonly params: ReadonlyQueryDict;
  }

  interface HttpContext {
    readonly routerMapItem: MapItem;
    readonly routerMap: MapItem[];
    readonly routerDir: string;
    readonly routerStrict: boolean;
  }
}

Startup.prototype.useRouter = function (): Startup {
  return this.use(async (ctx, next) => {
    if (ctx.routerDir == undefined) {
      setConfig(ctx, Constant.defaultRouterDir, Constant.defaultStrict);
    }
    if (!ctx.routerMapItem) {
      if (!parseRouter(ctx)) return;
    }
    await next();
  }).add((ctx) => {
    const filePath = path.join(
      process.cwd(),
      ctx.routerDir,
      ctx.routerMapItem.path
    );
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const actionClass = require(filePath).default;
    return new actionClass() as Action;
  });
};

Startup.prototype.useRouterParser = function <T extends Startup>(
  dir = Constant.defaultRouterDir,
  strict = Constant.defaultStrict
): T {
  return this.use(async (ctx, next) => {
    setConfig(ctx, dir, strict);
    if (!ctx.routerMapItem) {
      if (!parseRouter(ctx)) return;
    }
    await next();
  }) as T;
};

function setConfig(ctx: HttpContext, dir: string, strict: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx as any).routerDir = dir;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx as any).routerStrict = strict;
}

function parseRouter(ctx: HttpContext): boolean {
  const mapParser = new MapParser(ctx, ctx.routerDir, ctx.routerStrict);
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
    const reqPath = ctx.req.path;
    const mapPathStrs = mapItem.path.split("/");
    const reqPathStrs = reqPath.split("/");
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
