import { useMicroClient, InjectMicroClient } from "@halsp/micro-client";
import { MicroNatsClient } from "./client";
import { MicroNatsClientOptions } from "./options";

export { MicroNatsClient } from "./client";
export { MicroNatsClientOptions } from "./options";

declare module "@halsp/core" {
  interface Startup {
    useMicroNatsClient(
      options?: MicroNatsClientOptions & InjectMicroClient
    ): this;
  }
}

useMicroClient("useMicroNatsClient", MicroNatsClient);
