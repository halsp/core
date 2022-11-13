export { TestMicroMqttStartup } from "./test-micro-mqtt-startup";
export { TestMicroMqttClient } from "./test-micro-mqtt-client";
export { createMock, mockPkgName } from "./mock";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    export interface ProcessEnv {
      IS_LOCAL_TEST: "true" | "";
    }
  }
}
