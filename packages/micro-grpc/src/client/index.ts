import "@halsp/micro/client";
import { useMicroClient, InjectMicroClient } from "@halsp/micro/client";
import { MicroGrpcClientOptions } from "./options";
import { MicroGrpcClient } from "./client";

export { MicroGrpcClient } from "./client";
export { MicroGrpcClientOptions };
export { WriteIterator, ReadIterator } from "../stream";

declare module "@halsp/core" {
  interface Startup {
    useMicroGrpcClient(
      options?: MicroGrpcClientOptions & InjectMicroClient,
    ): this;
  }
}

useMicroClient("useMicroGrpcClient", MicroGrpcClient);
