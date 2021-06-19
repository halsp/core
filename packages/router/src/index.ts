import "sfa";
import { HttpContext, Startup, status } from "sfa";
import Config, {
  TsConfig,
  AppConfig,
  RouterConfig,
  TsStaticItemConfig,
} from "./Config";
import Action from "./Action";
import Authority from "./Authority";
import ApiDocs from "./ApiDocs";
import ApiDocsParam from "./ApiDocs/ApiDocsParam";
import ApiDocsIOParams from "./ApiDocs/ApiDocsParam/ApiDocsIOParams";
import ApiDocsInputParams from "./ApiDocs/ApiDocsParam/ApiDocsInputParams";
import ApiDocsOutputParams from "./ApiDocs/ApiDocsParam/ApiDocsOutputParams";
import ApiDocsStateCode from "./ApiDocs/ApiDocsParam/ApiDocsStateCode";
import ApiDocsConfig from "./ApiDocs/ApiDocsConfig";
import ApiDocsConfigPart from "./ApiDocs/ApiDocsConfig/ApiDocsConfigPart";
import MapPraser from "./Router/MapPraser";
import path = require("path");
import Constant from "./Constant";

export {
  Action,
  Authority,
  ApiDocs,
  ApiDocsParam,
  ApiDocsIOParams,
  ApiDocsInputParams,
  ApiDocsOutputParams,
  ApiDocsStateCode,
  ApiDocsConfigPart,
  ApiDocsConfig,
  Config,
  TsConfig,
  AppConfig,
  RouterConfig,
  TsStaticItemConfig,
};

declare module "sfa" {
  interface Startup {
    useRouter<T extends this>(): T;
    useRoutePraser<T extends this>(): T;
    useRouteAuth<T extends this>(builder: (ctx: HttpContext) => Authority): T;
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
  return useRoutePraser(this).add((ctx) => {
    const filePath = path.join(process.cwd(), getDir(ctx), ctx.actionPath);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const actionClass = require(filePath).default;
    return new actionClass() as Action;
  });
};

Startup.prototype.useRouteAuth = function <T extends Startup>(
  builder: (ctx: HttpContext) => Authority
): T {
  return useRoutePraser(this).add((ctx) => {
    const auth = builder(ctx);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (auth.roles as any) = ctx.actionRoles;
    return auth;
  });
};

Startup.prototype.useRoutePraser = function <T extends Startup>(): T {
  return useRoutePraser(this) as T;
};

function useRoutePraser<T extends Startup>(startup: T): T {
  return startup
    .use(async (ctx, next) => {
      ctx.res.setHeader("sfa-router", "https://github.com/sfajs/router");
      await next();
    })
    .use(async (ctx, next) => {
      if (!ctx.actionPath) {
        if (!praseRouter(ctx)) return;
      }
      await next();
    });
}

function praseRouter(ctx: HttpContext): boolean {
  const mapPraser = new MapPraser(ctx, getDir(ctx), getStrict(ctx));
  if (mapPraser.notFound) {
    ctx.notFoundMsg({
      message: `Can't find the path：${ctx.req.path}`,
      path: ctx.req.path,
    });
    return false;
  }
  if (mapPraser.methodNotAllowed) {
    ctx.res.body = {
      message: `method not allowed：${ctx.req.method}`,
      method: ctx.req.method,
      path: ctx.req.path,
    };
    ctx.res.status = status.StatusCodes.METHOD_NOT_ALLOWED;
    return false;
  }
  const mapItem = mapPraser.mapItem;
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

function getDir(ctx: HttpContext): string {
  const unitTest = ctx.bag<RouterConfig>("B-UnitTest");
  if (unitTest) {
    return unitTest.dir ?? Constant.defaultRouterDir;
  } else {
    return Config.getRouterDirPath(Config.default);
  }
}

function getStrict(ctx: HttpContext): boolean {
  const unitTest = ctx.bag<RouterConfig>("B-UnitTest");
  if (unitTest) {
    return unitTest.strict ?? !!Constant.defaultStrict;
  } else {
    return !!Config.default.router?.strict;
  }
}
