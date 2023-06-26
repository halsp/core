import { Startup } from "@halsp/core";
import "@halsp/http";
import Koa from "koa";
import { KoaMiddleware } from "./koa.middleware";

declare module "@halsp/core" {
  interface Startup {
    koa(middleware: Parameters<typeof Koa.prototype.use>[0]): this;
  }
}

Startup.prototype.koa = function (
  middleware: Parameters<typeof Koa.prototype.use>[0]
) {
  this.add(() => new KoaMiddleware(middleware), KoaMiddleware);
  return this;
};

export { Koa };
export { koaHalsp } from "./halsp.middleware";
