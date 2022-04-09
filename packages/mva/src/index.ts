import "@sfajs/core";
import { Startup } from "@sfajs/core";
import "@sfajs/views";
import "@sfajs/router";
import MvaConfig from "./MvaConfig";

export { MvaConfig };

declare module "@sfajs/core" {
  interface Startup {
    useMva<T extends this>(cfg?: MvaConfig): T;
  }
}

Startup.prototype.useMva = function <T extends Startup>(
  cfg = <MvaConfig>{}
): T {
  this.use(async (ctx, next) => {
    await next();

    const body = ctx.res.body;
    const replaceCode = (cfg.codes ?? [])
      .filter((code) => {
        if (typeof code == "number") {
          return code == ctx.res.status;
        } else {
          return code.code == ctx.res.status;
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
    if (replaceCode) {
      await ctx.view(replaceCode.path, body);
      ctx.res.status = replaceCode.replace;
      return;
    }

    if (ctx.res.isSuccess && ctx.actionMetadata != undefined) {
      await ctx.view(ctx.actionMetadata.reqPath, body);
    }
  });
  this.useViews(cfg.viewsConfig);
  this.useRouterParser(cfg.routerConfig);
  if (cfg.onParserAdded) {
    cfg.onParserAdded(this);
  }
  this.useRouter();

  return this as T;
};
