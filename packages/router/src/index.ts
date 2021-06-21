import "sfa";
import { HttpContext, Startup, status } from "sfa";
import Action from "./Action";
import MapParser from "./Map/MapParser";
import path = require("path");
import Constant from "./Constant";

export { Action };

declare module "sfa" {
  interface Startup {
    useRouter<T extends this>(): T;
    useRouterParser<T extends this>(dir?: string, strict?: boolean): T;
  }

  interface Request {
    readonly query: Record<string, string>;
  }

  interface HttpContext {
    readonly actionPath: string;
    readonly actionRoles: string[];
  }
}

Startup.prototype.useRouter = function <T extends Startup>(): T {
  return ensureRouterParser(this).add((ctx) => {
    const dir = ctx.bag<string>("ROUTER_DIR");
    const filePath = path
      .join(process.cwd(), dir, ctx.actionPath)
      .replace(/\\/g, "/");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const actionClass = require(filePath).default;
    return new actionClass() as Action;
  });
};

Startup.prototype.useRouterParser = function <T extends Startup>(
  dir = Constant.defaultRouterDir,
  strict = Constant.defaultStrict
): T {
  return useRouterParser(this, dir, strict) as T;
};

function ensureRouterParser<T extends Startup>(startup: T) {
  return startup.use(async (ctx, next) => {
    ctx.res.setHeader("sfa-router", "https://github.com/sfajs/router");
    if (ctx.bag<string>("ROUTER_DIR") == undefined) {
      setConfig(ctx, Constant.defaultRouterDir, Constant.defaultStrict);
    }
    if (!ctx.actionPath) {
      if (!parseRouter(ctx)) return;
    }
    await next();
  });
}

function useRouterParser<T extends Startup>(
  startup: T,
  dir: string,
  strict: boolean
): T {
  return startup.use(async (ctx, next) => {
    setConfig(ctx, dir, strict);
    if (!ctx.actionPath) {
      if (!parseRouter(ctx)) return;
    }
    await next();
  });
}

function setConfig(ctx: HttpContext, dir: string, strict: boolean) {
  ctx.res.setHeader("sfa-router", "https://github.com/sfajs/router");
  ctx.bag("ROUTER_DIR", dir);
  ctx.bag("ROUTER_STRICT", strict);
}

function parseRouter(ctx: HttpContext): boolean {
  const dir = ctx.bag<string>("ROUTER_DIR");
  const strict = ctx.bag<boolean>("ROUTER_STRICT");

  const mapParser = new MapParser(ctx, dir, strict);
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
    ctx.res.status = status.StatusCodes.METHOD_NOT_ALLOWED;
    return false;
  }
  const mapItem = mapParser.mapItem;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx as any).actionPath = mapItem.path;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx as any).actionRoles = mapItem.roles;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx.req as any).query = {};

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
      ctx.req.query[key] = value;
    }
  }

  return true;
}
