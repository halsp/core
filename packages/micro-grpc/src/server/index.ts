import "./startup";
import type grpc from "@grpc/grpc-js";
import { MicroGrpcOptions } from "../options";
import "@halsp/micro/dist/server";

declare module "@halsp/core" {
  interface Startup {
    useMicroGrpc(options?: MicroGrpcOptions): this;

    listen(): Promise<grpc.Server>;
    close(): Promise<void>;
  }

  interface Request {
    get call(): grpc.ServerUnaryCall<any, any>;
    get metadata(): grpc.Metadata;
  }
}
