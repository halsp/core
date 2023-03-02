import { RouterOptions } from "../src";
import "@halsp/common";
import { TestHttpStartup } from "@halsp/testing/dist/http";
import "../src";
import { TEST_ACTION_DIR } from "../src/constant";

export const testDir = "test/actions";

declare module "@halsp/testing/dist/http" {
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
