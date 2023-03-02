import { useMicroClient, InjectMicroClient } from "@halsp/micro-client";
import { MicroMqttClient } from "./client";
import { MicroMqttClientOptions } from "./options";

export { MicroMqttClient } from "./client";
export { MicroMqttClientOptions } from "./options";

declare module "@halsp/core" {
  interface Startup {
    useMicroMqtt(options?: MicroMqttClientOptions & InjectMicroClient): this;
  }
}

useMicroClient("useMicroMqtt", MicroMqttClient);
