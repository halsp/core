import * as sfa from "sfa";
import { RouterConfig } from "../src";

declare module "sfa" {
  interface Startup {
    useTest<T extends this>(config?: RouterConfig): T;
  }
}

sfa.Startup.prototype.useTest = function <T extends sfa.Startup>(
  this: sfa.Startup,
  config?: RouterConfig
): T {
  this.use(async (ctx, next) => {
    ctx.bag("ROUTER_DIR", config?.dir ?? "test/controllers");
    ctx.bag("ROUTER_STRICT", !!(config?.strict ?? false));
    await next();
  });
  return this as T;
};
