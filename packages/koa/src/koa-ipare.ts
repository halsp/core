import {
  Dict,
  HttpContext,
  NumericalHeadersDict,
  Request,
  Startup,
} from "@ipare/core";
import { Context, Next } from "koa";
import { KOA_CTX, KOA_NEXT } from "./constant";
import { koaResToIpareRes, ipareResToKoaRes } from "./res-transform";

class KoaStartup extends Startup {
  public async run(koaCtx: Context, koaNext: Next): Promise<void> {
    const ctx = new HttpContext(
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

export function koaIpare(useMiddlewares: (startup: Startup) => void) {
  const startup = new KoaStartup();
  useMiddlewares(startup);
  startup.use(async (ipareCtx) => {
    const koeCtx: Context = ipareCtx[KOA_CTX];
    const koaNext: Next = ipareCtx[KOA_NEXT];
    await ipareResToKoaRes(ipareCtx.res, koeCtx);
    await koaNext();
    await koaResToIpareRes(koeCtx, ipareCtx.res);
  });

  return async function (koaCtx: Context, koaNext: Next) {
    await startup.run(koaCtx, koaNext);
  };
}
