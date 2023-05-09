import { Startup } from "@halsp/core";
import "@halsp/http";
import Koa from "koa";
import { KoaMiddleware, KoaOptions } from "./koa.middleware";

declare module "@halsp/core" {
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
) {
  this.add(() => new KoaMiddleware(middleware, options), KoaMiddleware);
  return this;
};

export { Koa };
export { koaHalsp } from "./koa-halsp";
