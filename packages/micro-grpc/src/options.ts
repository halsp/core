import type grpc from "@grpc/grpc-js";
import type grpcLoader from "@grpc/proto-loader";

export interface MicroGrpcOptions extends grpc.ChannelOptions {
  host?: string;
  port?: number;
  credentials?: grpc.ServerCredentials;
  protoFiles?: string | string[];
  loaderOptions?: grpcLoader.Options;
}

export interface MicroGrpcClientOptions extends grpc.ChannelOptions {
  host?: string;
  port?: number;
  credentials?: grpc.ChannelCredentials;
  protoFiles?: string | string[];
  loaderOptions?: grpcLoader.Options;
}
