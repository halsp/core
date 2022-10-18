import { RouterOptions } from "../src";
import "@ipare/core";
import { TestHttpStartup } from "@ipare/testing-http";
import "../src";
import { TEST_ACTION_DIR } from "../src/constant";

export const testDir = "test/actions";

declare module "@ipare/testing-http" {
  interface TestHttpStartup {
    useTestRouter(config?: RouterOptions): this;
    useTestRouterParser(config?: RouterOptions): this;
  }
}

TestHttpStartup.prototype.useTestRouter = function (config = {}) {
  this[TEST_ACTION_DIR] = testDir;
  this.useRouter(config);
  return this;
};

TestHttpStartup.prototype.useTestRouterParser = function (config = {}) {
  this[TEST_ACTION_DIR] = testDir;
  this.useRouterParser(config);
  return this;
};
