import type grpcLoader from "@grpc/proto-loader";
import type grpc from "@grpc/grpc-js";
import path from "path";
import * as glob from "glob";

export interface Options {
  loaderOptions?: grpcLoader.Options;
  protoFiles?: string | string[];
}

export async function loadPackages(
  options: Options = {}
): Promise<grpc.GrpcObject> {
  let protoFiles = options.protoFiles;
  if (!protoFiles || (Array.isArray(protoFiles) && !protoFiles.length)) {
    const proptosDir = path.join(process.cwd(), "protos");
    protoFiles = glob
      .sync("*.proto", {
        cwd: proptosDir,
      })
      .map((f: string) => path.join(proptosDir, f));
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const grpcLoaderPkg = require("@grpc/proto-loader");
  const definition = await grpcLoaderPkg.load(
    protoFiles,
    options.loaderOptions
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const grpcPkg = require("@grpc/grpc-js");
  return grpcPkg.loadPackageDefinition(definition);
}
