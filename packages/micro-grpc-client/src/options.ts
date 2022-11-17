import * as grpc from "@grpc/grpc-js";
import * as grpcLoader from "@grpc/proto-loader";

export interface MicroGrpcClientOptions extends grpc.ChannelOptions {
  host?: string;
  port?: number;
  credentials?: grpc.ChannelCredentials;
  protoFiles?: string | string[];
  loaderOptions?: grpcLoader.Options;
}
