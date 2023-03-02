import { HttpStartup } from "@halsp/http";
import Koa from "koa";
import { KoaMiddleware, KoaOptions } from "./koa.middleware";

declare module "@halsp/http" {
  interface HttpStartup {
    koa(
      middleware: Parameters<typeof Koa.prototype.use>[0],
      options?: KoaOptions
    ): this;
  }
}

HttpStartup.prototype.koa = function (
  middleware: Parameters<typeof Koa.prototype.use>[0],
  options?: KoaOptions
) {
  this.add(() => new KoaMiddleware(middleware, options), KoaMiddleware);
  return this;
};

export { Koa };
export { koaHalsp } from "./koa-halsp";
