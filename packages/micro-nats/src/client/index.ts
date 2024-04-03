import "@halsp/micro/client";
import { useMicroClient, InjectMicroClient } from "@halsp/micro/client";
import { MicroNatsClientOptions } from "../options";
import { MicroNatsClient } from "./client";

declare module "@halsp/core" {
  interface Startup {
    useMicroNatsClient(
      options?: MicroNatsClientOptions & InjectMicroClient,
    ): this;
  }
}

useMicroClient("useMicroNatsClient", MicroNatsClient);
