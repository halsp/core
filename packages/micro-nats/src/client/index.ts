import "@halsp/micro/client";
import { useMicroClient, InjectMicroClient } from "@halsp/micro/client";
import { MicroNatsClientOptions } from "./options";
import { MicroNatsClient } from "./client";

export { MicroNatsClient };
export { MicroNatsClientOptions };

declare module "@halsp/core" {
  interface Startup {
    useMicroNatsClient(
      options?: MicroNatsClientOptions & InjectMicroClient,
    ): this;
  }
}

useMicroClient("useMicroNatsClient", MicroNatsClient);
