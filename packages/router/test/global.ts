import { RouterOptions } from "../src";
import "@ipare/core";
import { TestStartup } from "@ipare/core";
import "../src";

export const testDir = "test/actions";
function getDefaultConfig() {
  return {
    prefix: "",
    dir: testDir,
  };
}

declare module "@ipare/core" {
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
