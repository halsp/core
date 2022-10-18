import { Context, Dict, Request } from "@ipare/core";
import { HttpStartup, NumericalHeadersDict } from "@ipare/http";
import { Context as KoaContext, Next } from "koa";
import { KOA_CTX, KOA_NEXT } from "./constant";
import { koaResToIpareRes, ipareResToKoaRes } from "./res-transform";

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

    if (!("httpReq" in ctx)) {
      Object.defineProperty(ctx, "httpReq", {
        configurable: false,
        enumerable: false,
        get: () => koaCtx.req,
      });
    }
    ctx[KOA_CTX] = koaCtx;
    ctx[KOA_NEXT] = koaNext;

    await koaResToIpareRes(koaCtx, ctx.res);
    const res = await super.invoke(ctx);
    await ipareResToKoaRes(res, koaCtx);
  }
}

export function koaIpare(useMiddlewares: (startup: HttpStartup) => void) {
  const startup = new KoaStartup();
  useMiddlewares(startup);
  startup.use(async (ipareCtx) => {
    const koaCtx: KoaContext = ipareCtx[KOA_CTX];
    const koaNext: Next = ipareCtx[KOA_NEXT];
    await ipareResToKoaRes(ipareCtx.res, koaCtx);
    await koaNext();
    await koaResToIpareRes(koaCtx, ipareCtx.res);
  });

  return async function (koaCtx: KoaContext, koaNext: Next) {
    await startup.run(koaCtx, koaNext);
  };
}
