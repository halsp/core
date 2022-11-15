import { MicroStartup } from "@ipare/micro";
import { MicroGrpcOptions } from "./options";
import * as grpc from "@grpc/grpc-js";
import * as grpcLoader from "@grpc/proto-loader";
import { Context, isClass, normalizePath } from "@ipare/core";

export class MicroGrpcStartup extends MicroStartup {
  constructor(protected readonly options: MicroGrpcOptions) {
    super();
  }

  #handlers: {
    pattern: string;
    handler: (ctx: Context) => Promise<void> | void;
  }[] = [];

  protected server?: grpc.Server;

  async listen() {
    this.close(true);

    const opt: any = { ...this.options };
    delete opt.host;
    delete opt.port;
    opt.port = this.options.port ?? 5000;
    opt.host = this.options.host ?? "localhost";
    const url = `${opt.host}:${opt.port}`;

    const server = new grpc.Server();
    this.server = server;

    const packages = await this.#getPackages();
    for (const pkg of packages) {
      const services = Object.keys(pkg)
        .filter((item) => isClass(pkg[item]))
        .map((item) => pkg[item] as grpc.ServiceClientConstructor);
      for (const svc of services) {
        this.#addService(svc);
      }
    }

    await new Promise<Error | number>((resolve) => {
      server.bindAsync(
        url,
        this.options.credentials ?? grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            this.logger.error(err);
          }
          resolve(err ?? port);
        }
      );
    });
    this.server.start();

    return this.server;
  }

  async #getPackages() {
    const definition = await grpcLoader.load(
      this.options.protoFiles,
      this.options.loaderOptions
    );
    const grpcObject = grpc.loadPackageDefinition(definition);
    return Object.values(grpcObject);
  }

  #addService(svc: grpc.ServiceClientConstructor) {
    const server = this.server as grpc.Server;
    const implementation: grpc.UntypedServiceImplementation = {};
    Object.keys(svc.prototype).forEach((item) => {
      const methodPath = svc.prototype[item].path;
      const handler = this.#handlers.filter((item) =>
        isPathEqual(item.pattern, methodPath)
      )[0]?.handler;
      if (handler) {
        implementation[item] = this.#getServiceMethod(methodPath, handler);
      }
    });
    if (Object.keys(implementation).length) {
      server.addService(svc.service, implementation);
    }
  }

  #getServiceMethod(
    path: string,
    handler: (ctx: Context) => void | Promise<void>
  ): grpc.UntypedHandleCall {
    return async (
      call: grpc.ServerUnaryCall<any, any>,
      callback: grpc.sendUnaryData<any>
    ) => {
      await this.handleMessage(
        {
          id: path,
          pattern: path,
          data: call.request,
        },
        ({ result }) => {
          callback(null, result.data);
        },
        async (ctx) => {
          Object.defineProperty(ctx.req, "call", {
            configurable: true,
            enumerable: true,
            get: () => call,
          });
          Object.defineProperty(ctx.req, "metadata", {
            configurable: true,
            enumerable: true,
            get: () => call.metadata,
          });
          await handler(ctx);
        }
      );
    };
  }

  pattern(pattern: string, handler: (ctx: Context) => Promise<void> | void) {
    this.#handlers.push({ pattern, handler });
    return this;
  }

  patterns(
    ...patterns: {
      pattern: string;
      handler: (ctx: Context) => Promise<void> | void;
    }[]
  ) {
    patterns.forEach((item) => {
      this.pattern(item.pattern, item.handler);
    });
    return this;
  }

  async close(force: true): Promise<void>;
  async close(force?: false): Promise<Error | undefined>;
  async close(force?: boolean) {
    if (force) {
      this.server?.forceShutdown();
    } else {
      return await new Promise((resolve) => {
        this.server?.tryShutdown((err) => resolve(err));
      });
    }
  }
}

function isPathEqual(path1: string, path2: string) {
  return (
    normalizePath(path1.replace(/\./g, "/").toLowerCase()) ==
    normalizePath(path2.replace(/\./g, "/").toLowerCase())
  );
}
