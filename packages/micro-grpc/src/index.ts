import "@halsp/core";
import type grpc from "@grpc/grpc-js";

declare module "@halsp/core" {
  interface Request {
    get call(): grpc.ServerUnaryCall<any, any>;
    get metadata(): grpc.Metadata;
  }
}

export { MicroGrpcOptions } from "./options";
export { MicroGrpcStartup } from "./startup";
export { cliConfigHook } from "./cli-config";
export { WriteIterator, ReadIterator } from "@halsp/micro-common";
