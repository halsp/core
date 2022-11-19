import { useMicroClient, InjectMicroClient } from "@ipare/micro-client";
import { MicroGrpcClient, MicroGrpcClientOptions } from "./client";

export { cliConfigHook } from "./cli-config";
export { MicroGrpcClientOptions, MicroGrpcClient } from "./client";
export { WriteIterator, ReadIterator } from "@ipare/micro-common";

declare module "@ipare/core" {
  interface Startup {
    useMicroGrpc(options?: MicroGrpcClientOptions & InjectMicroClient): this;
  }
}

useMicroClient("useMicroGrpc", MicroGrpcClient);
