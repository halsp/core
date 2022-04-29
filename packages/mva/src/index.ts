import "@sfajs/core";
import { HttpContext, HttpException, Startup, HookType } from "@sfajs/core";
import "@sfajs/views";
import "@sfajs/router";
import MvaConfig, { CodeType } from "./mva-config";
import { ERROR_CODES, USED } from "./constant";
import { execNamedFilters } from "@sfajs/filter";
import { Action } from "@sfajs/router";

export { MvaConfig };
export { ResultFilter } from "./result.filter";

declare module "@sfajs/core" {
  interface Startup {
    useMva(cfg?: MvaConfig): this;
    useErrorPage(...codes: CodeType[]): this;
    useErrorPage(codes: CodeType[]): this;
  }
}

Startup.prototype.useErrorPage = function (...codes: any[]): Startup {
  if (this[ERROR_CODES]) return this;
  if (this[USED]) return this;

  if (codes.length == 1 && Array.isArray(codes[0])) {
    codes = codes[0];
  }
  codes = codes as CodeType[];

  this[ERROR_CODES] = codes;

  return this.hook(HookType.Exception, async (ctx, md, ex) => {
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
  }).use(async (ctx, next) => {
    await next();

    const codes: CodeType[] = this[ERROR_CODES];
    !!codes && (await errorView(ctx, codes));
  });
};

Startup.prototype.useMva = function (cfg = <MvaConfig>{}): Startup {
  if (this[USED]) return this;
  this[USED] = true;

  return this.hook((ctx, md) => {
    if (md instanceof Action) {
      ctx.actionMetadata.actionInstance = md;
    }
  })
    .use(async (ctx, next) => {
      await next();

      if (!ctx.res.isSuccess) return;

      const action = ctx.actionMetadata.actionInstance as Action;
      if (action) {
        const execResult = await execNamedFilters(
          action,
          true,
          "onResultExecuting"
        );
        if (!execResult) {
          return;
        }
      }

      await ctx.view(ctx.actionMetadata.reqPath, ctx.res.body);

      if (action) {
        await execNamedFilters(action, false, "onResultExecuted");
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
