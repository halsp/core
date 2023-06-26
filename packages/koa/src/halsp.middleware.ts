import { Context, Dict, Startup } from "@halsp/core";
import "@halsp/http";
import { NumericalHeadersDict } from "@halsp/http";
import { Context as KoaContext, Next } from "koa";
import { KOA_CTX, KOA_NEXT } from "./constant";
import { koaResToHalspRes, halspResToKoaRes } from "./res-transform";

export function koaHalsp(config: (startup: Startup) => void) {
  const startup = new Startup().useHttp();
  config(startup);
  startup.use(async (halspCtx) => {
    const koaCtx: KoaContext = halspCtx.get(KOA_CTX);
    const koaNext: Next = halspCtx.get(KOA_NEXT);
    await halspResToKoaRes(halspCtx.res, koaCtx);
    await koaNext();
    await koaResToHalspRes(koaCtx, halspCtx.res);
  });

  return async function (koaCtx: KoaContext, koaNext: Next) {
    const ctx = new Context();
    ctx.req
      .setPath(koaCtx.path)
      .setMethod(koaCtx.method)
      .setQuery(koaCtx.query as Dict<string>)
      .setHeaders(koaCtx.req.headers as NumericalHeadersDict)
      .setBody(koaCtx.body);

    if (!("reqStream" in ctx)) {
      Object.defineProperty(ctx, "reqStream", {
        configurable: false,
        enumerable: false,
        get: () => koaCtx.req,
      });
    }
    ctx.set(KOA_CTX, koaCtx);
    ctx.set(KOA_NEXT, koaNext);

    await koaResToHalspRes(koaCtx, ctx.res);
    const res = await startup["invoke"](ctx);
    await halspResToKoaRes(res, koaCtx);
  };
}
