import "@ipare/core";
import { Startup } from "@ipare/core";
import Koa from "koa";
import compose from "koa-compose";
import { UseKoaOptions } from "./use-koa-options";
import {
  createContext,
  koaResToIpareRes,
  ipareResToKoaRes,
} from "./res-transform";

declare module "@ipare/core" {
  interface Startup {
    useKoa<T extends this>(app: Koa, options?: UseKoaOptions): T;
  }
}

// step: ipare -> koa -> ipare ->koa ->ipare
Startup.prototype.useKoa = function <T extends Startup>(
  app: Koa,
  options: UseKoaOptions = {}
): T {
  app.middleware.splice(0, 0, async (koaCtx, next) => {
    koaCtx.status = koaCtx.ipareInStatus;
    await next();
  });
  const fn = compose(app.middleware);
  if (!app.listenerCount("error")) app.on("error", app.onerror);

  app.use(async (koaCtx) => {
    await koaResToIpareRes(koaCtx, koaCtx.ipareCtx.res); // step 2. koa -> ipare
    await koaCtx.ipareNext();
    await ipareResToKoaRes(koaCtx.ipareCtx.res, koaCtx); // step 3. ipare-> koa
  });

  this.use(async (ipareCtx, next) => {
    const koaCtx = await createContext(app, ipareCtx, options); // step 1. ipare-> koa
    koaCtx.ipareNext = next;
    koaCtx.ipareCtx = ipareCtx;

    koaCtx.ipareInStatus = koaCtx.status; // status will be set to 404 in 'handleRequest'

    await (app as any).handleRequest(koaCtx, fn);
    await koaResToIpareRes(koaCtx, ipareCtx.res); // step 4. koa -> ipare
  });
  return this as T;
};

export { UseKoaOptions, Koa };
export { koaIpare } from "./koa-ipare";
