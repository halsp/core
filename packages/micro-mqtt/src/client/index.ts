import "@halsp/micro/dist/client";
import { useMicroClient, InjectMicroClient } from "@halsp/micro/dist/client";
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
