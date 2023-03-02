import { useMicroClient, InjectMicroClient } from "@halsp/micro-client";
import { MicroNatsClient } from "./client";
import { MicroNatsClientOptions } from "./options";

export { MicroNatsClient } from "./client";
export { MicroNatsClientOptions } from "./options";

declare module "@halsp/common" {
  interface Startup {
    useMicroNats(options?: MicroNatsClientOptions & InjectMicroClient): this;
  }
}

useMicroClient("useMicroNats", MicroNatsClient);
