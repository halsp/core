import * as sfa from "sfa";
import "../src";

declare module "sfa" {
  interface Startup {
    useTest<T extends this>(config?: { dir?: string; prefix?: string }): T;
  }
}

sfa.Startup.prototype.useTest = function <T extends sfa.Startup>(
  this: sfa.Startup,
  config?: { dir?: string; prefix?: string }
): T {
  this.use(async (ctx, next) => {
    ctx.bag("ROUTER_DIR", config?.dir ?? "test/actions");
    ctx.bag("ROUTER_PREFIX", config?.prefix ?? "");
    await next();
  });
  return this as T;
};
