import "@halsp/micro/dist/client";
import { useMicroClient, InjectMicroClient } from "@halsp/micro/dist/client";
import { MicroTcpClientOptions } from "../options";
import { MicroTcpClient } from "./client";

declare module "@halsp/core" {
  interface Startup {
    useMicroTcpClient(
      options?: MicroTcpClientOptions & InjectMicroClient,
    ): this;
  }
}

useMicroClient("useMicroTcpClient", MicroTcpClient);
