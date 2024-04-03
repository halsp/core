import "@halsp/micro/client";
import { useMicroClient, InjectMicroClient } from "@halsp/micro/client";
import { MicroMqttClient } from "./client";
import { MicroMqttClientOptions } from "../options";

declare module "@halsp/core" {
  interface Startup {
    useMicroMqttClient(
      options?: MicroMqttClientOptions & InjectMicroClient,
    ): this;
  }
}

useMicroClient("useMicroMqttClient", MicroMqttClient);
