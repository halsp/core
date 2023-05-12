import { RouterOptions } from "../src";
import "@halsp/testing";
import "@halsp/http";
import "../src";
import { TEST_ACTION_DIR } from "../src/constant";
import { Startup } from "@halsp/core";

export const testDir = "test/actions";

declare module "@halsp/core" {
  interface Startup {
    useTestRouter(config?: RouterOptions): this;
    useTestRouterParser(config?: RouterOptions): this;
  }
}

Startup.prototype.useTestRouter = function (config = {}) {
  this[TEST_ACTION_DIR] = testDir;
  this.useRouter(config);
  return this;
};

Startup.prototype.useTestRouterParser = function (config = {}) {
  this[TEST_ACTION_DIR] = testDir;
  this.useRouterParser(config);
  return this;
};
