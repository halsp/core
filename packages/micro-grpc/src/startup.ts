import { MicroStartup } from "@halsp/micro";
import { MicroGrpcOptions } from "./options";
import * as grpc from "@grpc/grpc-js";
import { Context, getHalspPort, isClass, normalizePath } from "@halsp/core";
import { loadPackages, ReadIterator, WriteIterator } from "@halsp/micro-common";

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

    const opt: MicroGrpcOptions = { ...this.options };
    opt.port = this.options.port ?? getHalspPort(5000);
    opt.host = this.options.host ?? "0.0.0.0";
    const url = `${opt.host}:${opt.port}`;

    const server = new grpc.Server();
    this.server = server;

    const packages = await loadPackages({
      protoFiles: opt.protoFiles,
      loaderOptions: opt.loaderOptions,
    });
    for (const pkgName in packages) {
      const pkg = packages[pkgName];
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
          } else {
            resolve(port);
          }
        }
      );
    });

    server.start();
    this.logger.info(`Server started, listening port: ${bindPort}`);

    return server;
  }

  #addService(svc: grpc.ServiceClientConstructor) {
    const server = this.server as grpc.Server;
    const implementation: grpc.UntypedServiceImplementation = {};
    Object.keys(svc.prototype).forEach((item) => {
      const method = svc.prototype[item] as grpc.MethodDefinition<any, any>;
      const handler = this.#handlers.filter((item) =>
        isPathEqual(item.pattern, method.path)
      )[0]?.handler;
      if (handler) {
        implementation[item] = this.#getServiceMethod(method, handler);
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
    method: grpc.MethodDefinition<any, any>,
    handler: (ctx: Context) => void | Promise<void>
  ): grpc.UntypedHandleCall {
    async function prehook(ctx: Context, call: any) {
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
      if (method.responseStream) {
        ctx.res.setBody(new WriteIterator());
      }
      await handler(ctx);
    }
    function createServerPacket(call: any) {
      let data: any;
      if (method.requestStream) {
        data = new ReadIterator(call as grpc.ServerReadableStream<any, any>);
      } else {
        data = (call as grpc.ServerUnaryCall<any, any>).request;
      }

      return {
        id: method.path,
        pattern: method.path,
        data: data,
      };
    }

    if (method.responseStream) {
      return async (call: grpc.ServerWritableStream<any, any>) => {
        await this.handleMessage(
          createServerPacket(call),
          async ({ result }) => {
            if (result.error) {
              call.emit("error", new Error(result.error));
            } else {
              if (result.data instanceof WriteIterator) {
                for await (const item of result.data as WriteIterator) {
                  call.write(item);
                }
              } else {
                if (result.data) {
                  call.write(result.data);
                }
              }
            }
            call.end();
          },
          async (ctx) => await prehook(ctx, call)
        );
      };
    } else {
      return async (
        call: grpc.ServerUnaryCall<any, any>,
        callback: grpc.sendUnaryData<any>
      ) => {
        await this.handleMessage(
          createServerPacket(call),
          ({ result }) => {
            callback(
              result.error ? new Error(result.error) : null,
              result.data
            );
          },
          async (ctx) => await prehook(ctx, call)
        );
      };
    }
  }

  register(pattern: string, handler: (ctx: Context) => Promise<void> | void) {
    this.logger.debug(`Add pattern: ${pattern}`);
    this.#handlers.push({ pattern, handler });
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
