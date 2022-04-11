import "@sfajs/core";
import { HttpContext, HttpException, Startup } from "@sfajs/core";
import "@sfajs/views";
import "@sfajs/router";
import MvaConfig, { CodeType } from "./mva-config";
import { ERROR_CODES, USED } from "./constant";
import { HookType } from "@sfajs/core/dist/middlewares";

export { MvaConfig };

declare module "@sfajs/core" {
  interface Startup {
    useMva(cfg?: MvaConfig): this;
    useErrorPage(codes: CodeType[]): this;
  }
}

Startup.prototype.useErrorPage = function (codes: CodeType[]): Startup {
  if (this[ERROR_CODES]) return this;
  if (this[USED]) return this;
  this[ERROR_CODES] = codes;

  return this.hook(async (ctx, ex) => {
    if (!(ex instanceof HttpException)) {
      return false;
    }

    const replaceCode = getCode(codes, ex.status);
    if (!replaceCode) {
      return false;
    }

    await ctx.view(replaceCode.path, ctx.res.body);
    ctx.res.status = replaceCode.replace;
    return true;
  }, HookType.Exception).use(async (ctx, next) => {
    await next();

    const codes: CodeType[] = this[ERROR_CODES];
    !!codes && (await errorView(ctx, codes));
  });
};

Startup.prototype.useMva = function (cfg = <MvaConfig>{}): Startup {
  if (this[USED]) return this;
  this[USED] = true;

  return this.use(async (ctx, next) => {
    await next();

    if (ctx.res.isSuccess && ctx.actionMetadata != undefined) {
      await ctx.view(ctx.actionMetadata.reqPath, ctx.res.body);
    }
  })
    .useViews(cfg.viewsConfig)
    .useRouter(cfg.routerConfig);
};

async function errorView(ctx: HttpContext, codes: CodeType[]) {
  const replaceCode = getCode(codes, ctx.res.status);
  if (replaceCode) {
    await ctx.view(replaceCode.path, ctx.res.body);
    ctx.res.status = replaceCode.replace;
    return true;
  } else {
    return false;
  }
}

function getCode(
  codes: CodeType[],
  status: number
): { path: string; replace: number } {
  return codes
    .filter((code) => {
      if (typeof code == "number") {
        return code == status;
      } else {
        return code.code == status;
      }
    })
    .map((item) => {
      if (typeof item == "number") {
        return { path: item.toString(), replace: item };
      } else {
        return {
          path: item.code.toString(),
          replace: item.replace ?? item.code,
        };
      }
    })[0];
}
