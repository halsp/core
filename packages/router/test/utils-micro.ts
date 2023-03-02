import { RouterOptions } from "../src";
import "@halsp/common";
import { TestMicroStartup } from "@halsp/testing/dist/micro";
import { TestMicroRedisStartup } from "@halsp/testing/dist/micro-redis";
import { TestMicroNatsStartup } from "@halsp/testing/dist/micro-nats";
import "../src";
import { TEST_ACTION_DIR } from "../src/constant";
import { TestMicroTcpStartup } from "@halsp/testing/dist/micro-tcp";

export const testDir = "test/micro";

declare module "@halsp/testing/dist/micro" {
  interface TestMicroStartup {
    useTestRouter(config?: RouterOptions): this;
    useTestRouterParser(config?: RouterOptions): this;
  }
}

declare module "@halsp/testing/dist/micro-redis" {
  interface TestMicroRedisStartup {
    useTestRouter(config?: RouterOptions): this;
    useTestRouterParser(config?: RouterOptions): this;
  }
}

declare module "@halsp/testing/dist/micro-nats" {
  interface TestMicroNatsStartup {
    useTestRouter(config?: RouterOptions): this;
    useTestRouterParser(config?: RouterOptions): this;
  }
}
declare module "@halsp/testing/dist/micro-tcp" {
  interface TestMicroTcpStartup {
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

TestMicroRedisStartup.prototype.useTestRouter = function (config = {}) {
  this[TEST_ACTION_DIR] = testDir;
  this.useRouter(config);
  return this;
};

TestMicroRedisStartup.prototype.useTestRouterParser = function (config = {}) {
  this[TEST_ACTION_DIR] = testDir;
  this.useRouterParser(config);
  return this;
};

TestMicroNatsStartup.prototype.useTestRouter = function (config = {}) {
  this[TEST_ACTION_DIR] = testDir;
  this.useRouter(config);
  return this;
};

TestMicroNatsStartup.prototype.useTestRouterParser = function (config = {}) {
  this[TEST_ACTION_DIR] = testDir;
  this.useRouterParser(config);
  return this;
};

TestMicroTcpStartup.prototype.useTestRouter = function (config = {}) {
  this[TEST_ACTION_DIR] = testDir;
  this.useRouter(config);
  return this;
};

TestMicroTcpStartup.prototype.useTestRouterParser = function (config = {}) {
  this[TEST_ACTION_DIR] = testDir;
  this.useRouterParser(config);
  return this;
};
