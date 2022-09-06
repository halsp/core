import "@ipare/core";
import { Startup } from "@ipare/core";
import Koa from "koa";
import { KoaMiddleware, KoaOptions } from "./koa.middleware";

declare module "@ipare/core" {
  interface Startup {
    koa(
      middleware: Parameters<typeof Koa.prototype.use>[0],
      options?: KoaOptions
    ): this;
  }
}

Startup.prototype.koa = function (
  middleware: Parameters<typeof Koa.prototype.use>[0],
  options?: KoaOptions
): Startup {
  this.add(() => new KoaMiddleware(middleware, options), KoaMiddleware);
  return this;
};

export { Koa };
export { koaIpare } from "./koa-ipare";
