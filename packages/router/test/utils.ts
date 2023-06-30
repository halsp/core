import { RouterOptions } from "../src";
import "@halsp/testing";
import "../src";
import { Startup } from "@halsp/core";

export const testDir = () =>
  process.env.HALSP_ENV == "micro" ? "test/micro" : "test/actions";

declare module "@halsp/core" {
  interface Startup {
    useTestRouter(config?: RouterOptions & { dir?: string }): this;
  }
}

Startup.prototype.useTestRouter = function (config = {}) {
  process.env["HALSP_ROUTER_DIR"] = config?.dir ?? testDir();
  this.useRouter({
    prefix: config?.prefix,
    decorators: config?.decorators,
  });
  return this;
};
