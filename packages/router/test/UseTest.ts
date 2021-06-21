import * as sfa from "sfa";
import "../src";

declare module "sfa" {
  interface Startup {
    useTest<T extends this>(config?: { dir?: string; strict?: boolean }): T;
  }
}

sfa.Startup.prototype.useTest = function <T extends sfa.Startup>(
  this: sfa.Startup,
  config?: { dir: string; strict: boolean }
): T {
  this.use(async (ctx, next) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).routerDir = config?.dir ?? "test/controllers";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any).routerStrict = config?.strict ?? false;
    await next();
  });
  return this as T;
};
