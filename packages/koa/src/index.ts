import "@sfajs/core";
import { Startup } from "@sfajs/core";
import Koa from "koa";
import compose from "koa-compose";
import { UseKoaOptions } from "./use-koa-options";
import { createContext, koaResToSfaRes, sfaResToKoaRes } from "./res-transform";

declare module "@sfajs/core" {
  interface Startup {
    useKoa<T extends this>(app: Koa, options?: UseKoaOptions): T;
  }
}

// step: sfa -> koa -> sfa ->koa ->sfa
Startup.prototype.useKoa = function <T extends Startup>(
  app: Koa,
  options: UseKoaOptions = {}
): T {
  app.middleware.splice(0, 0, async (koaCtx, next) => {
    koaCtx.status = koaCtx.sfaInStatus;
    await next();
  });
  const fn = compose(app.middleware);
  if (!app.listenerCount("error")) app.on("error", app.onerror);

  app.use(async (koaCtx) => {
    await koaResToSfaRes(koaCtx, koaCtx.sfaCtx.res); // step 2. koa -> sfa
    await koaCtx.sfaNext();
    await sfaResToKoaRes(koaCtx.sfaCtx.res, koaCtx); // step 3. sfa-> koa
  });

  this.use(async (sfaCtx, next) => {
    const koaCtx = await createContext(app, sfaCtx, options); // step 1. sfa-> koa
    koaCtx.sfaNext = next;
    koaCtx.sfaCtx = sfaCtx;

    koaCtx.sfaInStatus = koaCtx.status; // status will be set to 404 in 'handleRequest'

    await (app as any).handleRequest(koaCtx, fn);
    await koaResToSfaRes(koaCtx, sfaCtx.res); // step 4. koa -> sfa
  });
  return this as T;
};

export { UseKoaOptions, Koa };
export { koaSfa } from "./koa-sfa";
