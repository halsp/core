import {
  Dict,
  HttpContext,
  NumericalHeadersDict,
  Request,
  Startup,
} from "@ipare/core";
import { Context, Next } from "koa";
import { koaResToIpareRes, ipareResToKoaRes } from "./res-transform";

class KoaStartup extends Startup {
  constructor(private readonly koaCtx: Context) {
    super();
  }

  public async run(): Promise<void> {
    const ctx = new HttpContext(
      new Request()
        .setPath(this.koaCtx.path)
        .setMethod(this.koaCtx.method)
        .setQuery(this.koaCtx.query as Dict<string>)
        .setHeaders(this.koaCtx.req.headers as NumericalHeadersDict)
        .setBody(this.koaCtx.body)
    );
    await koaResToIpareRes(this.koaCtx, ctx.res);
    const res = await super.invoke(ctx);
    await ipareResToKoaRes(res, this.koaCtx);
  }
}

export function koaIpare(
  useMiddlewares: (startup: Startup) => Promise<void> | void
) {
  return async function (koaCtx: Context, koaNext: Next) {
    const startup = new KoaStartup(koaCtx);
    await useMiddlewares(startup);
    startup.use(async (ipareCtx) => {
      await ipareResToKoaRes(ipareCtx.res, koaCtx);
      await koaNext();
      await koaResToIpareRes(koaCtx, ipareCtx.res);
    });
    await startup.run();
  };
}
