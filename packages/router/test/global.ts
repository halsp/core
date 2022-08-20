import { RouterOptions } from "../src";
import "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../src";
import { TEST_ACTION_DIR_BAG } from "../src/constant";

export const testDir = "test/actions";

declare module "@ipare/testing" {
  interface TestStartup {
    useTestRouter(config?: RouterOptions): this;
    useTestRouterParser(config?: RouterOptions): this;
  }
}

TestStartup.prototype.useTestRouter = function (config = {}) {
  this[TEST_ACTION_DIR_BAG] = testDir;
  this.useRouter(config);
  return this;
};

TestStartup.prototype.useTestRouterParser = function (config = {}) {
  this[TEST_ACTION_DIR_BAG] = testDir;
  this.useRouterParser(config);
  return this;
};
