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
  if (!config) {
    config = {};
  }
  if (!config.dir) {
    config.dir = "./test/controllers";
  }

  this.use(async (ctx, next) => {
    ctx.bag("B-UnitTest", config);
    await next();
  });
  return this as T;
};
