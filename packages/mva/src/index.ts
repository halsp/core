import { Context, HookType } from "@ipare/core";
import "@ipare/view";
import "@ipare/router";
import { MvaOptions, CodeType } from "./mva-options";
import { ERROR_CODES, USED } from "./constant";
import { execFilters } from "@ipare/filter";
import { Action } from "@ipare/router";
import { HttpException, HttpStartup } from "@ipare/http";

export { MvaOptions };
export { ResultFilter } from "./result.filter";

declare module "@ipare/http" {
  interface HttpStartup {
    useMva(options?: MvaOptions): this;
    useErrorPage(...codes: CodeType[]): this;
    useErrorPage(codes: CodeType[]): this;
  }
}

HttpStartup.prototype.useErrorPage = function (...codes: any[]) {
  if (this[ERROR_CODES]) return this;
  if (this[USED]) return this;

  if (codes.length == 1 && Array.isArray(codes[0])) {
    codes = codes[0];
  }
  codes = codes as CodeType[];

  this[ERROR_CODES] = codes;

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

    const codes: CodeType[] = this[ERROR_CODES];
    !!codes && (await errorView(ctx, codes));
  });
};

HttpStartup.prototype.useMva = function (options: MvaOptions = {}) {
  if (this[USED]) return this;
  this[USED] = true;

  const renderMethods = (() => {
    let result = options.renderMethods ?? ["get"];
    if (typeof result == "string") {
      result = [result];
    }
    return result;
  })();

  return this.hook((ctx, md) => {
    if (md instanceof Action) {
      ctx.actionMetadata.actionInstance = md;
    }
  })
    .use(async (ctx, next) => {
      await next();

      if (!ctx.res.isSuccess) return;
      if (
        !renderMethods.some((m) => m.toLowerCase() == "any") &&
        !renderMethods.some(
          (m) => m.toLowerCase() == ctx.req.method.toLowerCase()
        )
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
  const html = await ctx.view(url, ctx.res.body);
  if (html) {
    ctx.ok(html).set("content-type", "text/html");
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
