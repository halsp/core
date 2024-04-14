import "@halsp/micro/client";
import { useMicroClient, InjectMicroClient } from "@halsp/micro/client";
import { MicroTcpClientOptions } from "./options";
import { MicroTcpClient } from "./client";

export { MicroTcpClientOptions };
export { MicroTcpClient };

declare module "@halsp/core" {
  interface Startup {
    useMicroTcpClient(
      options?: MicroTcpClientOptions & InjectMicroClient,
    ): this;
  }
}

useMicroClient("useMicroTcpClient", MicroTcpClient);
