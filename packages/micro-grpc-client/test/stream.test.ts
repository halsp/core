import * as grpc from "@grpc/grpc-js";
import * as grpcLoader from "@grpc/proto-loader";
import { MicroGrpcClient, ReadIterator, WriteIterator } from "../src";

describe("stream", () => {
  it("should send stream request", async () => {
    interface ClientStreamService {
      testMethod(
        data: WriteIterator<{ reqMessage: string }>
      ): Promise<{ resMessage: string }>;
    }

    const server = new grpc.Server();
    await new Promise<number>((resolve, reject) => {
      server.bindAsync(
        "localhost:5020",
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            reject(err);
          }
          resolve(port);
        }
      );
    });
    const definition = await grpcLoader.load(
      "./test/protos/stream.client.proto"
    );
    const grpcObject = grpc.loadPackageDefinition(definition);
    const svc = grpcObject.clientStream[
      "ClientStreamService"
    ] as grpc.ServiceClientConstructor;
    server.addService(svc.service, {
      testMethod: async (
        call: grpc.ServerReadableStream<any, any>,
        callback: grpc.sendUnaryData<any>
      ) => {
        const result: any[] = [];
        const readIterator = new ReadIterator(call);
        for await (const item of readIterator) {
          result.push(item.reqMessage);
        }
        callback(null, {
          resMessage: result,
        });
      },
    });
    server.start();

    const client = new MicroGrpcClient({
      protoFiles: "./test/protos/stream.client.proto",
      port: 5020,
    });
    await client.connect();

    const testService = client.getService<ClientStreamService>(
      "clientStream",
      "ClientStreamService"
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
    const result = await testService.testMethod(writeIterator);

    server.forceShutdown();
    await client.dispose();

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 5000));

    expect(result).toEqual({
      resMessage: ["a", "b"],
    });
  }, 10000);

  it("should receive stream response", async () => {
    interface ServerStreamService {
      testMethod(data: {
        reqMessage: string;
      }): Promise<ReadIterator<{ resMessage: string }>>;
    }

    const server = new grpc.Server();
    await new Promise<number>((resolve, reject) => {
      server.bindAsync(
        "localhost:5021",
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            reject(err);
          }
          resolve(port);
        }
      );
    });
    const definition = await grpcLoader.load(
      "./test/protos/stream.server.proto"
    );
    const grpcObject = grpc.loadPackageDefinition(definition);
    const svc = grpcObject.serverStream[
      "ServerStreamService"
    ] as grpc.ServiceClientConstructor;
    server.addService(svc.service, {
      testMethod: async (call: grpc.ServerWritableStream<any, any>) => {
        call.write({
          resMessage: "1",
        });
        call.write({
          resMessage: call.request.reqMessage,
        });
        setTimeout(() => {
          call.write({
            resMessage: "2",
          });
          call.end();
        }, 1000);
      },
    });
    server.start();

    const client = new MicroGrpcClient({
      protoFiles: "./test/protos/stream.server.proto",
      port: 5021,
    });
    await client.connect();

    const testService = client.getService<ServerStreamService>(
      "serverStream",
      "ServerStreamService"
    ) as ServerStreamService;
    const result = await testService.testMethod({
      reqMessage: "abc",
    });

    const data: any[] = [];
    for await (const item of result) {
      data.push(item);
    }

    server.forceShutdown();
    await client.dispose();

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 5000));

    expect(data).toEqual([
      {
        resMessage: "1",
      },
      {
        resMessage: "abc",
      },
      {
        resMessage: "2",
      },
    ]);
  }, 10000);

  it("should send stream request and receive stream response", async () => {
    interface CSStreamService {
      testMethod(
        data: WriteIterator<{
          reqMessage: string;
        }>
      ): Promise<ReadIterator<{ resMessage: string }>>;
    }

    const server = new grpc.Server();
    await new Promise<number>((resolve, reject) => {
      server.bindAsync(
        "localhost:5022",
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          if (err) {
            reject(err);
          }
          resolve(port);
        }
      );
    });
    const definition = await grpcLoader.load("./test/protos/stream.cs.proto");
    const grpcObject = grpc.loadPackageDefinition(definition);
    const svc = grpcObject.csStream[
      "CSStreamService"
    ] as grpc.ServiceClientConstructor;
    server.addService(svc.service, {
      testMethod: async (call: grpc.ServerDuplexStream<any, any>) => {
        call.on("data", (item: any) => {
          call.write({
            resMessage: item.reqMessage,
          });
        });
        call.on("end", () => {
          call.end();
        });
      },
    });
    server.start();

    const client = new MicroGrpcClient({
      protoFiles: "./test/protos/stream.cs.proto",
      port: 5022,
    });
    await client.connect();

    const testService = client.getService<CSStreamService>(
      "csStream",
      "CSStreamService"
    ) as CSStreamService;

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
    const result = await testService.testMethod(writeIterator);

    const data: any[] = [];
    for await (const item of result) {
      data.push(item);
    }

    server.forceShutdown();
    await client.dispose();

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 5000));

    expect(data).toEqual([
      {
        resMessage: "a",
      },
      {
        resMessage: "b",
      },
    ]);
  }, 10000);
});
