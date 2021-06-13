import * as sfa from "sfa";
import { RouterConfig } from "../src";

declare module "sfa" {
  interface Startup {
    useTest(config?: RouterConfig): sfa.Startup;
  }
}

sfa.Startup.prototype.useTest = function (
  this: sfa.Startup,
  config?: RouterConfig
) {
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
  return this;
};
