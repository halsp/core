import { RouterOptions } from "../src";
import "@halsp/testing";
import "../src";
import { TEST_ACTION_DIR } from "../src/constant";
import { Startup } from "@halsp/core";

export const testDir = () =>
  process.env.HALSP_ENV == "micro" ? "test/micro" : "test/actions";

declare module "@halsp/core" {
  interface Startup {
    useTestRouter(config?: RouterOptions): this;
  }
}

Startup.prototype.useTestRouter = function (config = {}) {
  this[TEST_ACTION_DIR] = testDir();
  this.useRouter(config);
  return this;
};
