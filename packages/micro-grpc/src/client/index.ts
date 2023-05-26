import { useMicroClient, InjectMicroClient } from "@halsp/micro-client";
import { MicroGrpcClientOptions } from "../options";
import { MicroGrpcClient } from "./client";

declare module "@halsp/core" {
  interface Startup {
    useMicroGrpcClient(
      options?: MicroGrpcClientOptions & InjectMicroClient
    ): this;
  }
}

useMicroClient("useMicroGrpcClient", MicroGrpcClient);
