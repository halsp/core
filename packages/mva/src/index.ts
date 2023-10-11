import "@halsp/view";

import { Context, HookType, Startup } from "@halsp/core";
import { MvaOptions, CodeType } from "./mva-options";
import { execFilters } from "@halsp/filter";
import { Action } from "@halsp/router";
import { HttpException, HttpMethods } from "@halsp/http";

export { MvaOptions };
export { ResultFilter } from "./result.filter";

declare module "@halsp/core" {
  interface Startup {
    useMva(options?: MvaOptions): this;
    useErrorPage(...codes: CodeType[]): this;
    useErrorPage(codes: CodeType[]): this;
  }
}

const codesMap = new WeakMap<Startup, CodeType[]>();
Startup.prototype.useErrorPage = function (...codes: any[]) {
  if (codes.length == 1 && Array.isArray(codes[0])) {
    codes = codes[0];
  }
  codes = codes as CodeType[];

  const existCodes = codesMap.get(this) ?? [];
  existCodes.push(...codes);
  codesMap.set(this, existCodes);

  return this.hook(HookType.Error, async (ctx, md, ex) => {
    if (!(ex instanceof HttpException)) {
      return false;
    }

    const replaceCode = getCode(codes, ex.status);
    if (!replaceCode) {
      return false;
    }

    await render(ctx, replaceCode.path);
    ctx.res.status = replaceCode.replace;
    return true;
  }).use(async (ctx, next) => {
    await next();

    codes.length && (await errorView(ctx, codes));
  });
};

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useMva = function (options: MvaOptions = {}) {
  if (usedMap.get(this)) {
    return this;
  }
  usedMap.set(this, true);

  const renderMethods = (() => {
    let result = options.renderMethods ?? [HttpMethods.get];
    if (typeof result == "string") {
      result = [result];
    }
    return result;
  })();

  return this.useHttp()
    .hook((ctx, md) => {
      if (md instanceof Action) {
        ctx.actionMetadata.actionInstance = md;
      }
    })
    .use(async (ctx, next) => {
      await next();

      if (!ctx.res.isSuccess) return;
      if (
        !renderMethods.some((m) => HttpMethods.equal(m, HttpMethods.any)) &&
        !renderMethods.some((m) => HttpMethods.equal(m, ctx.req.method))
      ) {
        return;
      }
      if (options.randerEnable && !(await options.randerEnable(ctx))) {
        return;
      }

      const action = ctx.actionMetadata.actionInstance as Action;
      if (action) {
        const execResult = await execFilters(action, true, "onResultExecuting");
        if (execResult == false) {
          return;
        }
      }

      await render(ctx, ctx.actionMetadata.url);

      if (action) {
        await execFilters(action, false, "onResultExecuted");
      }
    })
    .useView(options.viewOptions)
    .useRouter(options.routerOptions);
};

async function errorView(ctx: Context, codes: CodeType[]) {
  const replaceCode = getCode(codes, ctx.res.status);
  if (replaceCode) {
    await render(ctx, replaceCode.path);
    ctx.res.status = replaceCode.replace;
    return true;
  } else {
    return false;
  }
}

async function render(ctx: Context, url: string) {
  await ctx.res.view(url, ctx.res.body);
}

function getCode(
  codes: CodeType[],
  status: number,
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
