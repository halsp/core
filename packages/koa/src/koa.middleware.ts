import { Middleware } from "@ipare/core";
import Koa from "koa";
import compose from "koa-compose";
import { KOA_MIDDLEWARES_BAG } from "./constant";
import {
  createContext,
  ipareResToKoaRes,
  koaResToIpareRes,
} from "./res-transform";

export interface KoaOptions {
  env?: string | undefined;
  keys?: string[] | undefined;
  proxy?: boolean | undefined;
  subdomainOffset?: number | undefined;
  proxyIpHeader?: string | undefined;
  maxIpsCount?: number | undefined;
}
export class KoaMiddleware extends Middleware {
  constructor(
    private readonly middleware: Parameters<typeof Koa.prototype.use>[0],
    private readonly options?: KoaOptions
  ) {
    super();
  }

  // step: ipare -> koa -> ipare ->koa ->ipare
  async invoke() {
    const middlewares =
      this.ctx.get<Parameters<typeof Koa.prototype.use>[0][]>(
        KOA_MIDDLEWARES_BAG
      ) ?? [];
    middlewares.push(this.middleware);

    if (this.isNextInstanceOf(KoaMiddleware)) {
      this.ctx.set(KOA_MIDDLEWARES_BAG, middlewares);
      return await this.next();
    }
    this.ctx.set(KOA_MIDDLEWARES_BAG, []);

    const app = new Koa(this.options);
    middlewares.splice(0, 0, async (koaCtx, next) => {
      koaCtx.status = koaCtx.ipareInStatus;
      await next();
    });
    middlewares.forEach((md) => app.use(md));

    const fn = compose(app.middleware);
    if (!app.listenerCount("error")) app.on("error", app.onerror);

    app.use(async (koaCtx) => {
      await koaResToIpareRes(koaCtx, koaCtx.ipareCtx.res); // step 2. koa -> ipare
      await koaCtx.ipareNext();
      await ipareResToKoaRes(koaCtx.ipareCtx.res, koaCtx); // step 3. ipare-> koa
    });

    const koaCtx = await createContext(app, this.ctx); // step 1. ipare-> koa
    koaCtx.ipareNext = this.next.bind(this);
    koaCtx.ipareCtx = this.ctx;

    koaCtx.ipareInStatus = koaCtx.status; // status will be set to 404 in 'handleRequest'

    await (app as any).handleRequest(koaCtx, fn);
    await koaResToIpareRes(koaCtx, this.ctx.res); // step 4. koa -> ipare
  }
}
