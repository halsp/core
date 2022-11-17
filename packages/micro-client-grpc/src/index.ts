import { addClientUse, InjectMicroClient } from "@ipare/micro-client";
import { MicroGrpcClient, MicroGrpcClientOptions } from "./MicroGrpcClient";

export { cliConfigHook } from "./cli-config";
export { MicroGrpcClientOptions, MicroGrpcClient } from "./MicroGrpcClient";

declare module "@ipare/core" {
  interface Startup {
    useMicroGrpc(options?: MicroGrpcClientOptions & InjectMicroClient): this;
  }
}

addClientUse("useMicroGrpc", MicroGrpcClient);
