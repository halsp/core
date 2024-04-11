import { MicroGrpcClient } from "../../src";
import * as grpc from "@grpc/grpc-js";
import * as grpcLoader from "@grpc/proto-loader";

describe("service", () => {
  it("should create service and call method", async () => {
    interface TestService {
      testMethod(data: { reqMessage: string }): Promise<{ resMessage: string }>;
    }

    const server = new grpc.Server();
    await new Promise<number>((resolve, reject) => {
      server.bindAsync(
        "0.0.0.0:5010",
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
      testMethod: (
        call: grpc.ServerUnaryCall<any, any>,
        callback: grpc.sendUnaryData<any>,
      ) => {
        callback(null, {
          resMessage: call.request.reqMessage,
        });
      },
    });
    server.start();

    const client = new MicroGrpcClient({
      protoFiles: "./test/protos/test.proto",
      host: "0.0.0.0",
      port: 5010,
      credentials: grpc.ChannelCredentials.createInsecure(),
    });
    await client["connect"]();

    const testService = client.getService<TestService>(
      "test",
      "TestServicE",
    ) as TestService;
    const result = await testService.testMethod({
      reqMessage: "abc",
    });

    server.forceShutdown();
    await client.dispose();

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

    expect(result).toEqual({
      resMessage: "abc",
    });
  }, 10000);

  it("should get service in multiple", async () => {
    const client = new MicroGrpcClient({
      protoFiles: [
        "./test/protos/stream.client.proto",
        "./test/protos/test.proto",
      ],
    });
    await client["connect"]();

    interface TestService {
      testMethod(data: { reqMessage: string }): Promise<{ resMessage: string }>;
    }
    const testService = client.getService<TestService>("test", "TestService2");

    await client.dispose();

    expect(!!testService).toBeTruthy();
  });

  it("should be undefined when get service that not exist", async () => {
    const client = new MicroGrpcClient({
      protoFiles: "./test/protos/test.proto",
    });
    await client["connect"]();

    interface TestService {
      testMethod(data: { reqMessage: string }): Promise<{ resMessage: string }>;
    }
    const testService = client.getService<TestService>(
      "test",
      "TestServiceNotExist",
    );

    await client.dispose();

    expect(!!testService).toBeFalsy();
  });

  it("should be undefined when get service method that not exist", async () => {
    const client = new MicroGrpcClient({
      protoFiles: "./test/protos/test.proto",
    });
    await client["connect"]();

    interface TestService {
      testMethod1(data: {
        reqMessage: string;
      }): Promise<{ resMessage: string }>;
    }
    const testService = client.getService<TestService>(
      "test",
      "TestService",
    ) as TestService;

    await client.dispose();

    expect(!!testService.testMethod1).toBeFalsy();
    expect(!!testService["testMethod"]).toBeTruthy();
  });
});
