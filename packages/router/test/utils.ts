import { RouterOptions } from "../src";
import "@halsp/testing";
import "../src";
import { Startup } from "@halsp/core";
import { HALSP_ROUTER_MODULE } from "../src/constant";

export const testDir = () =>
  process.env.HALSP_ENV == "micro" ? "test/micro" : "test/actions";

declare module "@halsp/core" {
  interface Startup {
    useTestRouter(
      config?: RouterOptions & { dir?: string; isModule?: boolean }
    ): this;
  }
}

Startup.prototype.useTestRouter = function (config = {}) {
  process.env["HALSP_ROUTER_DIR"] = config?.dir ?? testDir();
  process.env[HALSP_ROUTER_MODULE] = String(config?.isModule ?? false);

  this.useRouter({
    prefix: config?.prefix,
    decorators: config?.decorators,
  });
  return this;
};
