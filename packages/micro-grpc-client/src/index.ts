import { useMicroClient, InjectMicroClient } from "@ipare/micro-client";
import { MicroGrpcClient, MicroGrpcClientOptions } from "./MicroGrpcClient";

export { cliConfigHook } from "./cli-config";
export { MicroGrpcClientOptions, MicroGrpcClient } from "./MicroGrpcClient";
export { WriteIterator, ReadIterator } from "@ipare/micro-grpc-common";

declare module "@ipare/core" {
  interface Startup {
    useMicroGrpc(options?: MicroGrpcClientOptions & InjectMicroClient): this;
  }
}

useMicroClient("useMicroGrpc", MicroGrpcClient);
