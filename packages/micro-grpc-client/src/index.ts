import { useMicroClient, InjectMicroClient } from "@halsp/micro-client";
import { MicroGrpcClient, MicroGrpcClientOptions } from "./client";

export { cliConfigHook } from "./cli-config";
export { MicroGrpcClientOptions, MicroGrpcClient } from "./client";
export { WriteIterator, ReadIterator } from "@halsp/micro-common";

declare module "@halsp/common" {
  interface Startup {
    useMicroGrpc(options?: MicroGrpcClientOptions & InjectMicroClient): this;
  }
}

useMicroClient("useMicroGrpc", MicroGrpcClient);
