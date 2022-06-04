import { RouterConfig } from "../src";
import "@sfajs/core";
import { TestStartup } from "@sfajs/core";
import { TEST_STARTUP_ROUTER_CONFIG } from "../src/constant";
import "../src";

export const testDir = "test/actions";
function getDefaultConfig() {
  return {
    prefix: "",
    dir: testDir,
  };
}

declare module "@sfajs/core" {
  interface TestStartup {
    useTestConfig(config?: RouterConfig): this;
    useTestRouter(config?: RouterConfig): this;
  }
}

TestStartup.prototype.useTestConfig = function (
  config: RouterConfig = getDefaultConfig()
) {
  this[TEST_STARTUP_ROUTER_CONFIG] = config;
  return this;
};

TestStartup.prototype.useTestRouter = function (
  config: RouterConfig = getDefaultConfig()
) {
  this.useTestConfig(config);
  this.useRouter();
  return this;
};
