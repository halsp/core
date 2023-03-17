import { Context, Dict, Request } from "@halsp/core";
import { HttpStartup, NumericalHeadersDict } from "@halsp/http";
import { Context as KoaContext, Next } from "koa";
import { KOA_CTX, KOA_NEXT } from "./constant";
import { koaResToHalspRes, halspResToKoaRes } from "./res-transform";

class KoaStartup extends HttpStartup {
  public async run(koaCtx: KoaContext, koaNext: Next): Promise<void> {
    const ctx = new Context(
      new Request()
        .setPath(koaCtx.path)
        .setMethod(koaCtx.method)
        .setQuery(koaCtx.query as Dict<string>)
        .setHeaders(koaCtx.req.headers as NumericalHeadersDict)
        .setBody(koaCtx.body)
    );

    if (!("reqStream" in ctx)) {
      Object.defineProperty(ctx, "reqStream", {
        configurable: false,
        enumerable: false,
        get: () => koaCtx.req,
      });
    }
    ctx[KOA_CTX] = koaCtx;
    ctx[KOA_NEXT] = koaNext;

    await koaResToHalspRes(koaCtx, ctx.res);
    const res = await super.invoke(ctx);
    await halspResToKoaRes(res, koaCtx);
  }
}

export function koaHalsp(useMiddlewares: (startup: HttpStartup) => void) {
  const startup = new KoaStartup();
  useMiddlewares(startup);
  startup.use(async (halspCtx) => {
    const koaCtx: KoaContext = halspCtx[KOA_CTX];
    const koaNext: Next = halspCtx[KOA_NEXT];
    await halspResToKoaRes(halspCtx.res, koaCtx);
    await koaNext();
    await koaResToHalspRes(koaCtx, halspCtx.res);
  });

  return async function (koaCtx: KoaContext, koaNext: Next) {
    await startup.run(koaCtx, koaNext);
  };
}
