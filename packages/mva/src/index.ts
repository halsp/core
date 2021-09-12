import "sfa";
import { Startup } from "sfa";
import * as linq from "linq";
import "@sfajs/views";
import "@sfajs/router-act";
import MvaConfig from "./MvaConfig";

export { MvaConfig };

declare module "sfa" {
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
  this.useViews(cfg.viewsConfig);
  this.useRouter(cfg.routerConfig);

  return this as T;
};
