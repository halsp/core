export { TestMicroNatsStartup } from "./test-micro-nats-startup";
export { TestMicroNatsClient } from "./test-micro-nats-client";
export { createMock, mockPkgName } from "./mock";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    export interface ProcessEnv {
      IS_LOCAL_TEST: "true" | "";
    }
  }
}
