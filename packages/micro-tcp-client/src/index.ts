import { useMicroClient, InjectMicroClient } from "@halsp/micro-client";
import { MicroTcpClient } from "./client";
import { MicroTcpClientOptions } from "./options";

export { MicroTcpClient } from "./client";
export { MicroTcpClientOptions } from "./options";

declare module "@halsp/core" {
  interface Startup {
    useMicroTcp(options?: MicroTcpClientOptions & InjectMicroClient): this;
  }
}

useMicroClient("useMicroTcp", MicroTcpClient);
