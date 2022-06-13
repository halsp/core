import { RouterOptions } from "../src";
import "@sfajs/core";
import { TestStartup } from "@sfajs/core";
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
    useTestRouter(config?: RouterOptions): this;
  }
}

TestStartup.prototype.useTestRouter = function (
  config: RouterOptions = getDefaultConfig()
) {
  this.useRouter(config);
  return this;
};
