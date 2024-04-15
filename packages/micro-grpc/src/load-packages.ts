import * as grpcLoader from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";
import path from "path";
import { glob } from "glob";

export interface Options {
  loaderOptions?: grpcLoader.Options;
  protoFiles?: string | string[];
}

export async function loadPackages(
  options: Options = {},
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

  const definition = await grpcLoader.load(protoFiles, options.loaderOptions);

  return grpc.loadPackageDefinition(definition);
}
