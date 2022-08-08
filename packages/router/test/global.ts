import { RouterOptions } from "../src";
import "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../src";

export const testDir = "test/actions";
function getDefaultConfig() {
  return {
    prefix: "",
    dir: testDir,
  };
}

declare module "@ipare/testing" {
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
