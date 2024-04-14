import * as grpc from "@grpc/grpc-js";
import * as grpcLoader from "@grpc/proto-loader";
import { MicroGrpcClient, WriteIterator } from "../../src/client";

describe("error", () => {
  it("should send stream request and throw error", async () => {
    interface ClientStreamService {
      testMethod(
        data: WriteIterator<{ reqMessage: string }>,
      ): Promise<{ resMessage: string }>;
    }

    const server = new grpc.Server();
    await new Promise<number>((resolve, reject) => {
      server.bindAsync(
        "0.0.0.0:5030",
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            reject(err);
          }
          resolve(port);
        },
      );
    });
    const definition = await grpcLoader.load(
      "./test/protos/stream.client.proto",
    );
    const grpcObject = grpc.loadPackageDefinition(definition);
    const svc = grpcObject.clientStream[
      "ClientStreamService"
    ] as grpc.ServiceClientConstructor;
    server.addService(svc.service, {
      testMethod: async (
        call: grpc.ServerReadableStream<any, any>,
        callback: grpc.sendUnaryData<any>,
      ) => {
        callback(new Error("err"));
      },
    });
    server.start();

    const client = new MicroGrpcClient({
      protoFiles: "./test/protos/stream.client.proto",
      host: "0.0.0.0",
      port: 5030,
    });
    await client["connect"]();

    const testService = client.getService<ClientStreamService>(
      "clientStream",
      "ClientStreamService",
    ) as ClientStreamService;
    const writeIterator = new WriteIterator();
    (async () => {
      writeIterator.push({
        reqMessage: "a",
      });
      setTimeout(() => {
        writeIterator.push({
          reqMessage: "b",
        });
        writeIterator.end();
      }, 1000);
    })();
    let err: Error | undefined;
    try {
      await testService.testMethod(writeIterator);
    } catch (e) {
      err = e as Error;
    }

    server.forceShutdown();
    await client.dispose();

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

    expect(err?.message?.includes("UNKNOWN: err")).toBeTruthy();
  }, 10000);

  it("should throw error when request is stream but data is not WriteIterator", async () => {
    const client = new MicroGrpcClient({
      protoFiles: "./test/protos/stream.client.proto",
    });
    await client["connect"]();

    let err: Error | undefined;
    try {
      await client.send("clientStream/ClientStreamService/testMethod", {});
    } catch (e) {
      err = e as Error;
    }
    expect(err?.message).toBe(
      "Send data should be WriteIterator when request is stream",
    );
  });

  it("should throw error when request is not stream but data is WriteIterator", async () => {
    const client = new MicroGrpcClient({
      protoFiles: "./test/protos/stream.server.proto",
    });
    await client["connect"]();

    let err: Error | undefined;
    try {
      await client.send(
        "serverStream/ServerStreamService/testMethod",
        new WriteIterator(),
      );
    } catch (e) {
      err = e as Error;
    }
    expect(err?.message).toBe(
      "Send data should not be WriteIterator when request is not stream",
    );
  });

  it("should throw error when send path is error", async () => {
    const client = new MicroGrpcClient({
      protoFiles: "./test/protos/test.proto",
    });
    await client["connect"]();

    {
      let err: Error | undefined;
      try {
        await client.send("test/testService1/testMethod", {});
      } catch (e) {
        err = e as Error;
      }
      expect(err?.message).toBe("The service or method is not exist");
    }

    {
      let err: Error | undefined;
      try {
        await client.send("test/testService/testMethod1", {});
      } catch (e) {
        err = e as Error;
      }
      expect(err?.message).toBe("The service or method is not exist");
    }
  });
});

describe("emit error", () => {
  it("should emit and throw error", async () => {
    let called = false;

    const server = new grpc.Server();
    await new Promise<number>((resolve, reject) => {
      server.bindAsync(
        "0.0.0.0:5033",
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            reject(err);
          }
          resolve(port);
        },
      );
    });
    const definition = await grpcLoader.load("./test/protos/test.proto");
    const grpcObject = grpc.loadPackageDefinition(definition);
    const svc = grpcObject.test["TestService"] as grpc.ServiceClientConstructor;
    server.addService(svc.service, {
      testMethod: async (
        call: grpc.ServerReadableStream<any, any>,
        callback: grpc.sendUnaryData<any>,
      ) => {
        called = true;
        callback(new Error("err"));
      },
    });
    server.start();

    const client = new MicroGrpcClient({
      protoFiles: "./test/protos/test.proto",
      port: 5033,
    });
    client.logger = console as any;
    await client["connect"]();

    client.emit("test/TestService/testMethod", {});
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

    server.forceShutdown();
    await client.dispose();

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

    expect(called).toBeTruthy();
  }, 10000);

  it("should emit stream request and throw error", async () => {
    let called = false;

    const server = new grpc.Server();
    await new Promise<number>((resolve, reject) => {
      server.bindAsync(
        "0.0.0.0:5032",
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            reject(err);
          }
          resolve(port);
        },
      );
    });
    const definition = await grpcLoader.load(
      "./test/protos/stream.client.proto",
    );
    const grpcObject = grpc.loadPackageDefinition(definition);
    const svc = grpcObject.clientStream[
      "ClientStreamService"
    ] as grpc.ServiceClientConstructor;
    server.addService(svc.service, {
      testMethod: async (
        call: grpc.ServerReadableStream<any, any>,
        callback: grpc.sendUnaryData<any>,
      ) => {
        called = true;
        callback(new Error("err"));
      },
    });
    server.start();

    const client = new MicroGrpcClient({
      protoFiles: "./test/protos/stream.client.proto",
      port: 5032,
    });
    client.logger = console as any;
    await client["connect"]();

    const writeIterator = new WriteIterator();
    writeIterator.push({
      reqMessage: "a",
    });
    writeIterator.end();
    client.emit("clientStream/ClientStreamService/testMethod", writeIterator);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

    server.forceShutdown();
    await client.dispose();

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

    expect(called).toBeTruthy();
  }, 10000);
});
