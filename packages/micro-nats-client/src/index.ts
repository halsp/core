import { useMicroClient, InjectMicroClient } from "@ipare/micro-client";
import { MicroNatsClient } from "./client";
import { MicroNatsClientOptions } from "./options";

export { MicroNatsClient } from "./client";
export { MicroNatsClientOptions } from "./options";

declare module "@ipare/core" {
  interface Startup {
    useMicroNats(options?: MicroNatsClientOptions & InjectMicroClient): this;
  }
}

useMicroClient("useMicroNats", MicroNatsClient);
