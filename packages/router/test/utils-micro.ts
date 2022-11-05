import { RouterOptions } from "../src";
import "@ipare/core";
import { TestMicroStartup } from "@ipare/testing-micro";
import "../src";
import { TEST_ACTION_DIR } from "../src/constant";

export const testDir = "test/micro";

declare module "@ipare/testing-micro" {
  interface TestMicroStartup {
    useTestRouter(config?: RouterOptions): this;
    useTestRouterParser(config?: RouterOptions): this;
  }
}

TestMicroStartup.prototype.useTestRouter = function (config = {}) {
  this[TEST_ACTION_DIR] = testDir;
  this.useRouter(config);
  return this;
};

TestMicroStartup.prototype.useTestRouterParser = function (config = {}) {
  this[TEST_ACTION_DIR] = testDir;
  this.useRouterParser(config);
  return this;
};
