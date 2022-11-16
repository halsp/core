import { MicroStartup } from "@ipare/micro";
import { MicroGrpcOptions } from "./options";
import * as grpc from "@grpc/grpc-js";
import * as grpcLoader from "@grpc/proto-loader";
import { Context, isClass, normalizePath } from "@ipare/core";
import path from "path";
import * as glob from "glob";

export class MicroGrpcStartup extends MicroStartup {
  constructor(protected readonly options: MicroGrpcOptions = {}) {
    super();
  }

  #handlers: {
    pattern: string;
    handler: (ctx: Context) => Promise<void> | void;
  }[] = [];

  protected server?: grpc.Server;

  async listen() {
    this.close();

    const opt: any = { ...this.options };
    delete opt.host;
    delete opt.port;
    opt.port = this.options.port ?? 5000;
    opt.host = this.options.host ?? "0.0.0.0";
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

    const bindPort = await new Promise<number>((resolve, reject) => {
      server.bindAsync(
        url,
        this.options.credentials ?? grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            reject(err);
          }

          resolve(port);
        }
      );
    });

    server.start();
    this.logger.info(`Server started, listening port: ${bindPort}`);

    return server;
  }

  async #getPackages() {
    let protoFiles = this.options.protoFiles;
    if (!protoFiles || (Array.isArray(protoFiles) && !protoFiles.length)) {
      const proptosDir = path.join(process.cwd(), "protos");
      protoFiles = glob
        .sync("*.proto", {
          cwd: proptosDir,
        })
        .map((f) => path.join(proptosDir, f));
    }

    const definition = await grpcLoader.load(
      protoFiles,
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
      this.logger.debug(
        `Add service: ${Object.keys(implementation).join(",")}`
      );
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
    this.logger.debug(`Add pattern: ${pattern}`);
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

  async close() {
    if (!this.server) return;
    const server = this.server;

    let shutdownTimeout = false;
    await new Promise<void>((resolve) => {
      const shutdownTimer = setTimeout(() => {
        shutdownTimeout = true;
        server.forceShutdown();
        this.logger.error(
          `Server shutdown timeout and will invoke force shutdown`
        );
        resolve();
      }, 2000);

      server.tryShutdown((err) => {
        clearTimeout(shutdownTimer);
        if (shutdownTimeout) return;

        if (err) {
          this.logger.error(
            `Server shutdown error and will invoke force shutdown, err = ${err.message}`
          );
          server.forceShutdown();
          resolve();
        } else {
          this.logger.info("Server shutdown success");
          resolve();
        }
      });
    });

    if (this.server == server) {
      this.server = undefined;
    }
  }
}

function isPathEqual(path1: string, path2: string) {
  return (
    normalizePath(path1.replace(/\./g, "/").toLowerCase()) ==
    normalizePath(path2.replace(/\./g, "/").toLowerCase())
  );
}
