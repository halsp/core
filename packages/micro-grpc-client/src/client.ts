import * as grpc from "@grpc/grpc-js";
import { IMicroClient } from "@ipare/micro-client";
import { loadPackages, ReadIterator, WriteIterator } from "@ipare/micro-common";
import { isClass } from "@ipare/core";
import { MicroGrpcClientOptions } from "./options";

export { MicroGrpcClientOptions } from "./options";

export class MicroGrpcClient extends IMicroClient {
  constructor(protected readonly options: MicroGrpcClientOptions = {}) {
    super();
  }

  readonly #services: {
    client: grpc.Client;
    packageName: string;
    serviceName: string;
  }[] = [];
  #packages?: grpc.GrpcObject;

  async connect() {
    this.#packages = await loadPackages({
      protoFiles: this.options.protoFiles,
      loaderOptions: this.options.loaderOptions,
    });
  }

  #close() {
    this.#services.forEach((svc) => {
      svc.client.close();
    });
    this.#services.splice(0);
    this.#packages = undefined;
  }

  /**
   * for @ipare/inject
   */
  async dispose() {
    this.#close();
  }

  getService<T extends object = any>(
    packageName: string,
    serviceName: string
  ): T | undefined {
    const service = this.#createService(packageName, serviceName);
    if (!service) return;

    const result = new Proxy(
      {},
      {
        get: (target, p: string) => {
          if (p.toLowerCase() in target) {
            return target[p.toLowerCase()];
          } else {
            return undefined;
          }
        },
      }
    );
    Object.values(service.constructor.prototype).forEach((m) => {
      const method = m as grpc.MethodDefinition<any, any>;
      const name = method.originalName as string;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const client = this;
      result[name.toLowerCase()] = function (data: any) {
        return client.send(`/${packageName}.${serviceName}/${name}`, data);
      };
    });
    return result as T;
  }

  send<T = any>(
    pattern: string,
    data: WriteIterator
  ): Promise<ReadIterator<T> | T>;
  send<T = any>(
    pattern: string,
    data?: Record<string, any>
  ): Promise<ReadIterator<T> | T>;
  async send(
    pattern: string,
    data: WriteIterator | Record<string, any> = {}
  ): Promise<any> {
    if (!this.#packages) {
      throw new Error("Should invoke .connect() first");
    }

    const method = this.#getMethodByPattern(pattern);
    if (!method) {
      throw new Error("The service or method is not exist");
    }
    this.#checkSendData(method, data);

    if (method.requestStream) {
      const requestIterator = data as WriteIterator;
      if (method.responseStream) {
        const call: grpc.ClientDuplexStream<any, any> = method();
        (async () => {
          for await (const item of requestIterator) {
            call.write(item);
          }
          call.end();
        })();
        return new ReadIterator(call);
      } else {
        return await new Promise((resolve, reject) => {
          const call: grpc.ClientWritableStream<any> = method(
            (err: grpc.ServerErrorResponse | undefined, response: any) => {
              if (err) {
                reject(err);
              } else {
                resolve(response);
              }
            }
          );
          (async () => {
            for await (const item of requestIterator) {
              call.write(item);
            }
            call.end();
          })();
        });
      }
    } else {
      const requestData = data as Record<string, any>;
      if (method.responseStream) {
        const call: grpc.ClientReadableStream<any> = method(requestData);
        return new ReadIterator(call);
      } else {
        return await new Promise((resolve, reject) => {
          method(
            requestData,
            (err: grpc.ServerErrorResponse | undefined, response: any) => {
              if (err) {
                reject(err);
              } else {
                resolve(response);
              }
            }
          );
        });
      }
    }
  }

  emit(pattern: string, data: WriteIterator): void;
  emit(pattern: string, data?: Record<string, any>): void;
  emit(pattern: string, data: WriteIterator | Record<string, any> = {}): void {
    if (!this.#packages) {
      throw new Error("Should invoke .connect() first");
    }

    const method = this.#getMethodByPattern(pattern);
    if (!method) {
      throw new Error("The service or method is not exist");
    }
    this.#checkSendData(method, data);

    if (method.requestStream) {
      const requestIterator = data as WriteIterator;
      const call: grpc.ClientWritableStream<any> = method(
        (err: grpc.ServerErrorResponse | undefined) => {
          if (err) {
            this.logger.error(err);
          }
        }
      );
      (async () => {
        for await (const item of requestIterator) {
          call.write(item);
        }
        call.end();
      })();
    } else {
      method(
        data as Record<string, any>,
        (err: grpc.ServerErrorResponse | undefined) => {
          if (err) {
            this.logger.error(err);
          }
        }
      );
    }
  }

  #createService(packageName: string, serviceName: string) {
    const existService = this.#services.filter(
      (s) =>
        s.packageName.toLowerCase() == packageName.toLowerCase() &&
        s.serviceName.toLowerCase() == serviceName.toLowerCase()
    )[0];
    if (existService) {
      return existService.client;
    }

    const packages = this.#packages as grpc.GrpcObject;
    let serviceConstructor: grpc.ServiceClientConstructor | undefined;
    for (const pkgName in packages) {
      if (pkgName.toLowerCase() != packageName.toLowerCase()) continue;

      const pkg = packages[pkgName];
      const svcs = Object.values(pkg).filter((item) =>
        isClass(item)
      ) as grpc.ServiceClientConstructor[];
      for (const svc of svcs) {
        if (svc.serviceName.toLowerCase() == serviceName.toLowerCase()) {
          serviceConstructor = svc;
          break;
        }
      }
      if (serviceConstructor) {
        break;
      }
    }

    if (serviceConstructor) {
      const opt: MicroGrpcClientOptions & Record<string, any> = {
        ...this.options,
      };
      delete opt.host;
      delete opt.port;
      opt.port = this.options.port ?? 5000;
      opt.host = this.options.host ?? "0.0.0.0";
      const url = `${opt.host}:${opt.port}`;

      const service = new serviceConstructor(
        url,
        opt.credentials ?? grpc.ChannelCredentials.createInsecure(),
        opt
      );
      this.#services.push({
        packageName: packageName,
        serviceName: serviceName,
        client: service,
      });
      return service;
    }
  }

  #getMethodByPattern(pattern: string) {
    const parts = pattern
      .replace(/\./g, "/")
      .split("/")
      .filter((item) => !!item);
    if (parts.length != 3) {
      return;
    }

    const packageName = parts[0];
    const serviceName = parts[1];
    const methodName = parts[2];

    const service = this.#createService(packageName, serviceName);
    if (!service) {
      return;
    }

    const result = service[methodName]?.bind(service);
    if (result) {
      Object.keys(service[methodName]).forEach((k) => {
        result[k] = service[methodName][k];
      });
    }
    return result as (((...args: any[]) => any) | undefined) &
      grpc.MethodDefinition<any, any>;
  }

  #checkSendData(
    method: grpc.MethodDefinition<any, any>,
    data: WriteIterator | Record<string, any>
  ) {
    if (method.requestStream) {
      if (!(data instanceof WriteIterator)) {
        throw new Error(
          "Send data should be WriteIterator when request is stream"
        );
      }
    } else {
      if (data instanceof WriteIterator) {
        throw new Error(
          "Send data should not be WriteIterator when request is not stream"
        );
      }
    }
  }
}
