import {
  Dict,
  HttpContext,
  NumericalHeadersDict,
  Request,
  Startup,
} from "@sfajs/core";
import { Context, Next } from "koa";
import { koaResToSfaRes, sfaResToKoaRes } from "./res-transform";

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
    await koaResToSfaRes(this.koaCtx, ctx.res);
    const res = await super.invoke(ctx);
    await sfaResToKoaRes(res, this.koaCtx);
  }
}

export function koaSfa(
  useMiddlewares: (startup: Startup) => Promise<void> | void
) {
  return async function sfa(koaCtx: Context, koaNext: Next) {
    const startup = new KoaStartup(koaCtx);
    await useMiddlewares(startup);
    startup.use(async (sfaCtx) => {
      await sfaResToKoaRes(sfaCtx.res, koaCtx);
      await koaNext();
      await koaResToSfaRes(koaCtx, sfaCtx.res);
    });
    await startup.run();
  };
}
