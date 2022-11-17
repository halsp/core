import * as grpc from "@grpc/grpc-js";
import { IMicroClient } from "@ipare/micro-client";
import {
  loadPackages,
  ReadIterator,
  WriteIterator,
} from "@ipare/micro-grpc-common";
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

  getService<T extends grpc.Client = grpc.Client>(
    packageName: string,
    serviceName: string
  ) {
    return this.#createService(packageName, serviceName) as T;
  }

  send<T>(
    path: string,
    options?: {
      requestStream: true;
      responseStream: true;
      requestIterator: WriteIterator;
    }
  ): Promise<ReadIterator<T>>;
  send<T>(
    path: string,
    options?: {
      requestStream?: false;
      responseStream: true;
      requestData: any;
    }
  ): Promise<ReadIterator<T>>;
  send<T>(
    path: string,
    options?: {
      requestStream: true;
      responseStream: false;
      requestIterator: WriteIterator;
    }
  ): Promise<T>;
  send<T>(
    path: string,
    options?: {
      requestStream?: false;
      responseStream: false;
      requestData: any;
    }
  ): Promise<T>;
  async send(
    pattern: string,
    data: {
      requestStream?: boolean;
      responseStream?: boolean;
      requestIterator?: WriteIterator;
      requestData?: any;
    } = {}
  ): Promise<any> {
    this.#checkParams(data);

    const method = this.#getMethodByPattern(pattern);
    if (!method) {
      throw new Error("The service or method is not exist");
    }

    if (data.requestStream) {
      const requestIterator = data.requestIterator as WriteIterator;
      if (data.responseStream) {
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
      const requestData = data.requestData;
      if (data.responseStream) {
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

  emit(
    path: string,
    options?: {
      requestStream: true;
      requestIterator: WriteIterator;
    }
  ): void;
  emit(
    path: string,
    options?: {
      requestStream?: false;
      requestData: any;
    }
  ): void;
  emit(
    pattern: string,
    data: {
      requestStream?: boolean;
      requestIterator?: WriteIterator;
      requestData?: any;
    } = {}
  ): void {
    this.#checkParams(data);

    const method = this.#getMethodByPattern(pattern);
    if (!method) {
      throw new Error("The service or method is not exist");
    }

    if (data.requestStream) {
      const requestIterator = data.requestIterator as WriteIterator;
      const call: grpc.ClientWritableStream<any> = method();
      (async () => {
        for await (const item of requestIterator) {
          call.write(item);
        }
        call.end();
      })();
    } else {
      method(data.requestData);
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
        if (
          svc.prototype.serviceName.toLowerCase() == serviceName.toLowerCase()
        ) {
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

  #getMethodByPattern(pattern: string): ((...args: any[]) => any) | undefined {
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

    return service[methodName];
  }

  #checkParams(data: {
    requestStream?: boolean;
    requestIterator?: WriteIterator;
    requestData?: any;
  }) {
    if (!this.#packages) {
      throw new Error("The connection is not connected");
    }

    if (data.requestStream) {
      if (!data.requestIterator) {
        throw new Error(
          "Augument requestIterator should be defined when requestStream is true"
        );
      }
    } else {
      if (!data.requestData) {
        throw new Error(
          "Augument requestData should be defined when requestStream is false or undefined"
        );
      }
    }
  }
}
