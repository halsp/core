import { MicroGrpcOptions } from "../options";
import * as grpc from "@grpc/grpc-js";
import {
  Context,
  getHalspPort,
  isClass,
  normalizePath,
  Startup,
} from "@halsp/core";
import { loadPackages } from "../load-packages";
import { handleMessage } from "@halsp/micro/dist/server";
import { ReadIterator, WriteIterator } from "../stream";

const usedMap = new WeakMap<Startup, boolean>();
Startup.prototype.useMicroGrpc = function (options: MicroGrpcOptions = {}) {
  if (usedMap.get(this)) {
    return this;
  }
  usedMap.set(this, true);

  initStartup.call(this, options);

  return this.useMicro();
};

function initStartup(this: Startup, options: MicroGrpcOptions) {
  const handlers: {
    pattern: string;
    handler?: (ctx: Context) => Promise<void> | void;
  }[] = [];

  let server: grpc.Server | undefined = undefined;
  this.extend("listen", async () => {
    server = new grpc.Server();
    await close.call(this, server);

    const opt: MicroGrpcOptions = { ...options };
    opt.port = options.port ?? getHalspPort(5000);
    opt.host = options.host ?? "0.0.0.0";
    const url = `${opt.host}:${opt.port}`;

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
        addService.bind(this)(server, svc, handlers);
      }
    }

    const bindPort = await new Promise<number>((resolve, reject) => {
      (server as grpc.Server).bindAsync(
        url,
        options.credentials ?? grpc.ServerCredentials.createInsecure(),
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
  })
    .extend("close", async () => {
      await close.call(this, server);
      this.logger.info("Server shutdown success");
    })
    .extend(
      "register",
      (pattern: string, handler?: (ctx: Context) => Promise<void> | void) => {
        this.logger.debug(`Add pattern: ${pattern}`);
        handlers.push({ pattern, handler });
        return this;
      }
    );
}

async function close(this: Startup, server?: grpc.Server) {
  if (!server) return;

  let shutdownTimeout = false;
  await new Promise<void>((resolve) => {
    const shutdownTimer = setTimeout(() => {
      shutdownTimeout = true;
      this.logger.error(
        `Server shutdown timeout and will invoke force shutdown`
      );
      server.forceShutdown();
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
        resolve();
      }
    });
  });
}

function addService(
  this: Startup,
  server: grpc.Server,
  svc: grpc.ServiceClientConstructor,
  handlers: {
    pattern: string;
    handler?: (ctx: Context) => Promise<void> | void;
  }[]
) {
  const implementation: grpc.UntypedServiceImplementation = {};
  Object.keys(svc.prototype).forEach((item) => {
    const method = svc.prototype[item] as grpc.MethodDefinition<any, any>;
    const handler = handlers.filter((item) =>
      isPathEqual(item.pattern, method.path)
    )[0];
    if (handler) {
      implementation[item] = getServiceMethod.bind(this)(
        method,
        handler.handler
      );
    }
  });
  if (Object.keys(implementation).length) {
    server.addService(svc.service, implementation);
    this.logger.debug(`Add service: ${Object.keys(implementation).join(",")}`);
  }
}

function getServiceMethod(
  this: Startup,
  method: grpc.MethodDefinition<any, any>,
  handler?: (ctx: Context) => void | Promise<void>
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
    handler && (await handler(ctx));
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
      await handleMessage.bind(this)(
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
      await handleMessage.bind(this)(
        createServerPacket(call),
        ({ result }) => {
          callback(result.error ? new Error(result.error) : null, result.data);
        },
        async (ctx) => await prehook(ctx, call)
      );
    };
  }
}

function isPathEqual(path1: string, path2: string) {
  return (
    normalizePath(path1.replace(/\./g, "/").toLowerCase()) ==
    normalizePath(path2.replace(/\./g, "/").toLowerCase())
  );
}
